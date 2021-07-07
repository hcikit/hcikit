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

/**
 * Finds all of the props for a given task based on which ones start with a lowercase value
 * and then also the ones that match the task name (which must start with a capital letter).
 *
 * @param {object} props
 * @param {string} task
 * @returns an object containing all of the props for a given task
 */
export function scopePropsForTask(props, task) {
  return merge(
    pickBy(props, (_, k) => k[0] === k[0].toLowerCase()),
    props[task]
  );
}

/**
 * Given a configuration, determines whether the experiment is complete or not.
 *
 * @param {object} configuration
 * @returns {boolean} indicates whether an experiment is complete or not.
 */
export function experimentComplete(configuration) {
  return configuration[__INDEX__] === COMPLETE;
}

// TODO: Convert getcurrentprops into a "selector" function
// TODO: why does it have a default, implicit index of [0]?
/**
 * This function reads the index of the configuration and outputs the current props for it.
 * If there is no index it assumes the experiment is just beginning.
 *
 * @param {object} configuration
 * @returns the props for the current index of an experiment
 */
export function getCurrentProps(configuration) {
  return getPropsFor(configuration[__INDEX__] || [0], configuration);
}

// TODO: should this add an index?
// TODO: This has a bug, it returns an empty object if the experiment is complete which is a bad thing I think?
// TODO: should throw an error if it is out of range.
/**
 * Gets the props for an experiment with a given index.
 *
 * @param {Array<number>} index
 * @param {*} configuration
 * @param {boolean} deleteLogs whether to include the logs or not.
 * @returns the props for a given index on a configuration.
 */
export function getPropsFor(index, configuration, deleteLogs = true) {
  if (experimentComplete(configuration)) {
    return {};
  }

  let props = {};

  // TODO: should this be for a leaf index only?
  index = getLeafIndex(index, configuration);

  // Loop over every level of the index, collecting the props from that level at every step.
  // We work our way down from the top in order to let properties override each other,
  // More specific props override other ones.
  for (const nextLevelIndex of index) {
    let properties = Object.assign({}, configuration);

    // We want to ignore the children props.
    delete properties.children;

    configuration = configuration.children[nextLevelIndex];

    // This gives us a deep merge, which means changes don't propagate.
    props = merge(props, properties);
  }

  // Because the above for loop changes configuration, this configuration now talks about the bottom
  // level which we haven't looked at quite yet.
  props = merge(props, configuration);

  if (deleteLogs) {
    delete props.logs;
  }

  return props;
}

/**
 * Traverses down the tree to the requested index and then returns the config at that index.
 *
 * @param {Array<number>} index
 * @param {*} initialConfig
 * @returns the requested level of config
 */
export function getConfigAtIndex(index, initialConfig) {
  // TODO: this can return a null object which is a problem.

  return index.reduce((config, value) => {
    return config.children[value];
  }, initialConfig);
}

/**
 * Finds the nearest leaf index to a starting index by traversing down the tree and always choosing
 * the first child.
 * @param {Array<number>} index
 * @param {*} configuration
 * @returns {Array<number>} the nearest leaf index.
 */
export function getLeafIndex(index, configuration) {
  index = [...index];

  while ("children" in getConfigAtIndex(index, configuration)) {
    index.push(0);
  }
  return index;
}

/**
 * Returns the next leaf index after this task is complete. The function is slightly misnamed because it doesn't actually change any indices.
 *
 * @param {*} configuration
 * @returns {Array<number>}
 */
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

/**
 * This function actually places a new log object on the config at the current index, or if the index isn't a leaf it finds the leaf index.
 *
 * @param {*} config
 * @param {*} log
 * @returns
 */
export function logToConfig(config, log) {
  if (experimentComplete(config)) {
    console.error("Attempting to log when the experiment is complete.");
    return;
  }

  let index = config[__INDEX__] || getLeafIndex([0], config);

  if (typeof log !== "object") {
    log = { value: log };
  }

  modifyConfiguration(
    config,
    index,
    {
      logs: [
        ...(getConfigAtIndex(index, config).logs || []),
        { ...log, timestamp: Date.now() },
      ],
    },
    false
  );
}

/**
 * Takes the config and actually modifies something about it according to the modified config.
 * modifiedConfig is an object and all of the properties in it overwrite the current properties at the current leaf index.
 *
 * @param {*} config
 * @param {Array<number>} index
 * @param {object} modifiedConfig
 * @param {*} logResult
 */
export function modifyConfiguration(
  config,
  index,
  modifiedConfig,
  logResult = true
) {
  // TODO: this should maybe fail on completed experiments because it cannot log properly.

  const originalConfig = config;

  if (logResult) {
    let configToEdit = getConfigAtIndex(index, config);

    logToConfig(originalConfig, {
      from: pick(configToEdit, Object.keys(modifiedConfig)),
      to: modifiedConfig,
      index,
      eventType: "CONFIG_MODIFICATION",
    });
  }

  for (let i = 0; i < index.length; i++) {
    let nextLevelIndex = index[i];

    config.children = [
      ...config.children.slice(0, nextLevelIndex),
      {
        ...config.children[nextLevelIndex],
      },
      ...config.children.slice(nextLevelIndex + 1),
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

/**
 * Takes an index and tells us what task number it is. This is useful for progress bars.
 * One trick to using this is we can truncate a config and just take one of the children, then
 * that gives us the progress within a certain section of an experiment.
 * @param {*} index
 * @param {*} config
 * @returns
 */
export function indexToTaskNumber(index, config) {
  // TODO: this can be replaced with iterate config maybe?
  // TODO: maybe index can be converted to a leaf node
  let number = 0;
  let toSearch = [[]];

  // Basically just do a depth first search until we find the correct index.
  // We can't know where the leaf nodes are so we need to search every node.
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

/**
 * Takes a task number and returns an index. This is useful for dev tools because it can let us
 * move forward in the experiment.
 * @param {*} taskNumber
 * @param {*} config
 * @returns
 */
export function taskNumberToIndex(taskNumber, config) {
  // TODO: this can be replaced with iterate config maybe?
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

export function getTotalTasks(config) {
  // TODO: this can be replaced with iterate config maybe? Could be a one liner, just iterateConfig then return the length of it.
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

// TODO: why is this even a generator... This is silly it adds so much complexity, it should just return all of the indices. I guess the upside is for searches. If it is a generator we can just search until we found something, which is really nice for some cases.
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
  return Array.from(iterateConfig(config)).map((index) =>
    getPropsFor(index, config)
  );
}

export function flatten(config) {
  return Array.from(iterateConfig(config)).map((index) =>
    getPropsFor(index, config, false)
  );
}
