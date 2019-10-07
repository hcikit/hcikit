import { mergeWith, pickBy, isEqual, pick } from "lodash-es";

// TODO: mergeWith is very slow which slows everything down with lots of onlogs.
// TODO: document everything here...
// TODO: should this work with a config with no children? Does it work with no children?

// TODO: some of these functions I can maybe use generators to reduce computation and make things faster?
// TODO: some of these should definitely be immutable but aren't... I'd rather everything here is immutable

// TODO: configuration => config, order should be standardised so the config always comes first.

export const __INDEX__ = "__INDEX__";
const COMPLETE = "__COMPLETE__";

export function mergeArraysSpecial(object, source) {
  return mergeWith(object, source, (value, srcValue) => {
    if (Array.isArray(value)) {
      return srcValue;
    }
  });
}

let merge = mergeArraysSpecial;

export function scopePropsForTask(props, task) {
  return merge(
    pickBy(props, (_, k) => k[0] === k[0].toLowerCase()),
    props[task]
  );
}

export function experimentComplete(configuration) {
  return configuration[__INDEX__] === COMPLETE;
}

// TODO: Convert getcurrentprops into a "selector" function
export function getCurrentProps(configuration) {
  return getPropsFor(configuration[__INDEX__] || [0], configuration);
}

// TODO: should this add an index?
export function getPropsFor(index, configuration) {
  if (experimentComplete(configuration)) {
    return {};
  }

  let props = {};
  // TODO: should this be for a leaf index only?
  index = getLeafIndex(index, configuration);

  for (const nextLevelIndex of index) {
    let properties = Object.assign({}, configuration);

    delete properties.children;

    configuration = configuration.children[nextLevelIndex];
    props = merge(props, properties);
  }

  props = merge(props, configuration);

  delete props.logs;

  return props;
}

export function getConfigAtIndex(index, initialConfig) {
  return index.reduce((config, value) => {
    return config.children[value];
  }, initialConfig);
}

export function getLeafIndex(index, configuration) {
  index = [...index];

  while ("children" in getConfigAtIndex(index, configuration)) {
    index.push(0);
  }
  return index;
}

export function markTaskComplete(configuration) {
  if (experimentComplete(configuration)) {
    return [];
  }

  let index = [0];
  if (configuration[__INDEX__]) {
    index = [...configuration[__INDEX__]];
  }

  index = getLeafIndex(index, configuration);

  let newIndexValue;

  do {
    newIndexValue = index.pop() + 1;
    let currentChildren = getConfigAtIndex(index, configuration).children;

    if (newIndexValue < currentChildren.length) {
      index.push(newIndexValue);
      break;
    }
  } while (index.length);

  if (index.length === 0) {
    return COMPLETE;
  }

  return getLeafIndex(index, configuration);
}

export function logToConfig(config, log) {
  if (experimentComplete(config)) {
    console.error("Attempting to log when the experiment is complete.");
    return;
  }
  let index = config[__INDEX__] || getLeafIndex([0], config);

  modifyConfiguration(
    config,
    index,
    {
      logs: [
        ...(getConfigAtIndex(index, config).logs || []),
        { ...log, timestamp: Date.now() }
      ]
    },
    false
  );
}

export function logActionToConfig(config, action) {
  logToConfig(config, { ...action, eventType: "ACTION" });
}

// TODO: this should maybe fail on completed experiments because it cannot log properly.
export function modifyConfiguration(
  config,
  index,
  modifiedConfig,
  logResult = true
) {
  const originalConfig = config;

  if (logResult) {
    let configToEdit = getConfigAtIndex(index, config);

    logToConfig(originalConfig, {
      from: pick(configToEdit, Object.keys(modifiedConfig)),
      to: modifiedConfig,
      index,
      type: "CONFIG_MODIFICATION"
    });
  }

  for (let i = 0; i < index.length; i++) {
    let nextLevelIndex = index[i];

    config.children = [
      ...config.children.slice(0, nextLevelIndex),
      {
        ...config.children[nextLevelIndex]
      },
      ...config.children.slice(nextLevelIndex + 1)
    ];

    config = config.children[nextLevelIndex];
  }

  Object.assign(config, modifiedConfig);
}

/**
 *
 * Edits a config by adding all of newConfig values at a certain depth. Depth works like slice (negative values start from the end, positive from the start)
 *
 * @param {object} config
 * @param {object} newConfig The key/values to overwrite
 * @param {int} depth the depth where 0 is the root, negative numbers work from the current config upwards (-1 being one up from the current position, and positive numbers move downwards). Not passing a depth results in the current level being edited
 */
export function modifyConfigurationAtDepth(config, newConfig, depth) {
  // TODO: this function is not consistent with modify config (config, newconfig, depth) vs (config, index, newconfig)
  if (experimentComplete(config)) {
    console.error(
      "Attempting to modify config when the experiment is complete."
    );
    return;
  }

  let index = [0];
  if (config[__INDEX__]) {
    index = [...config[__INDEX__]];
  }

  index = getLeafIndex(index, config);

  let indexToEdit = index.slice(0, depth);

  modifyConfiguration(config, indexToEdit, newConfig);
}

// TODO: this can be replaced with iterate config maybe?
export function indexToTaskNumber(index, config) {
  // TODO: maybe index can be converted to a leaf node
  // TODO: this adds lots of nodes to a list which seems slow.. this might actually be best as a recursive function :(
  let number = 0;
  let toSearch = [[]];

  while (toSearch.length !== 0) {
    let searchingIndex = toSearch.pop();

    let searchingConfig = getConfigAtIndex(searchingIndex, config);

    if ("children" in searchingConfig) {
      for (let i = searchingConfig.children.length - 1; i >= 0; i--) {
        toSearch.push([...searchingIndex, i]);
      }
    } else {
      if (isEqual(searchingIndex, index)) {
        return number;
      }

      number++;
    }
  }
}

// TODO: this can be replaced with iterate config maybe?
export function taskNumberToIndex(taskNumber, config) {
  let number = 0;
  let toSearch = [[]];

  while (toSearch.length > 0) {
    let searchingIndex = toSearch.pop();

    let searchingConfig = getConfigAtIndex(searchingIndex, config);

    if ("children" in searchingConfig) {
      for (let i = searchingConfig.children.length - 1; i >= 0; i--) {
        toSearch.push([...searchingIndex, i]);
      }
    } else {
      if (taskNumber === number) {
        return searchingIndex;
      }
      number++;
    }
  }
}

// TODO: this can be replaced with iterate config maybe?
export function getTotalTasks(config) {
  let tasks = 0;
  let toSearch = [[]];

  while (toSearch.length > 0) {
    let searchingIndex = toSearch.pop();
    let searchingConfig = getConfigAtIndex(searchingIndex, config);

    if ("children" in searchingConfig) {
      for (let i = searchingConfig.children.length - 1; i >= 0; i--) {
        toSearch.push([...searchingIndex, i]);
      }
    } else {
      tasks++;
    }
  }

  return tasks;
}

// TODO: maybe this function should just return all of the indices?
export function* iterateConfig(config) {
  let toSearch = [[]];

  while (toSearch.length > 0) {
    let searchingIndex = toSearch.pop();
    let searchingConfig = getConfigAtIndex(searchingIndex, config);

    if ("children" in searchingConfig) {
      for (let i = searchingConfig.children.length - 1; i >= 0; i--) {
        toSearch.push([...searchingIndex, i]);
      }
    } else {
      yield searchingIndex;
    }
  }

  return;
}

export function iterateConfigWithProps(config) {
  return Array.from(iterateConfig(config)).map(index =>
    getPropsFor(index, config)
  );
}
