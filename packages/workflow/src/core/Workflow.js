import { connect } from "react-redux";
import { mergeWith, pickBy, isEqual } from "lodash-es";

// TODO: mergeWith is very slow which slows everything down with lots of onlogs.
// TODO: document everything here...
// TODO: should this work with a config with no children? Does it work with no children?

// TODO: some of these functions I can maybe use generators to reduce computation and make things faster?

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

export function taskComplete(configuration) {
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

export function log(config, log) {
  if (experimentComplete(config)) {
    console.error("Attempting to log when the experiment is complete.");
    return;
  }
  let index = config[__INDEX__] || getLeafIndex([0], config);

  let newTask = { ...getConfigAtIndex(index, config) };
  // TODO: Change the way we do configs.
  // newTask.logs = [...newTask.logs, newLog]

  if (!newTask.logs) {
    newTask.logs = [];
  }

  newTask.logs = [
    ...newTask.logs,
    {
      ...log,
      timestamp: Date.now()
    }
  ];

  modifyConfig(index, config, newTask);
}

export function logAction(config, action) {
  if (experimentComplete(config)) {
    console.error("Attempting to log when the experiment is complete.");
    return;
  }
  let index = config[__INDEX__] || getLeafIndex([0], config);

  let newTask = { ...getConfigAtIndex(index, config) };

  if (!newTask.actions) {
    newTask.actions = [];
  }
  newTask.actions = [
    ...newTask.actions,
    {
      action,
      timestamp: Date.now()
    }
  ];

  modifyConfig(index, config, newTask);
}

export function modifyConfig(index, config, newConfig) {
  index = [...index];

  for (let i = 0; i < index.length; i++) {
    let nextLevelIndex = index[i];

    config.children = [
      ...config.children.slice(0, nextLevelIndex),
      {
        ...config.children[nextLevelIndex]
      },
      ...config.children.slice(nextLevelIndex + 1)
    ];

    if (i < index.length - 1) {
      config = config.children[nextLevelIndex];
    }
  }

  config.children[index[index.length - 1]] = newConfig;
}

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

export const withRawConfiguration = connect(state => {
  return { configuration: state.Configuration };
});

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
