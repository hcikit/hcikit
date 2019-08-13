import { connect } from "react-redux";
import { mergeWith, pickBy } from "lodash-es";

// TODO: mergeWith is very slow which slows everything down with lots of onlogs.
// TODO: there is a lot of duplication in here.
// TODO: need to document the frameworks use of index or rename it to something less commonly used because it gets deleted before passing it.

export const __INDEX__ = "__INDEX__";

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
  return configuration[__INDEX__] && configuration[__INDEX__].length === 0;
}

// TODO: Convert getcurrentprops into a "selector" function
export function getCurrentProps(configuration) {
  if (experimentComplete(configuration)) {
    return {};
  }

  let props = {};
  let index = configuration[__INDEX__] || [0];
  index = getLeafIndex(index, configuration);

  for (const nextLevelIndex of index) {
    let properties = Object.assign({}, configuration);

    delete properties.children;

    configuration = configuration.children[nextLevelIndex];
    props = merge(props, properties);
  }

  return merge(props, configuration);
}

export function getConfigAtIndex(index, initialConfig) {
  return index.reduce((config, value) => {
    return config.children[value];
  }, initialConfig);
}

export function getLeafIndex(index, configuration) {
  if (index.length === 0) {
    return [];
  }

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

  return getLeafIndex(index, configuration);
}

// Returns true if the participant has finished all the steps in this part of the configuration.
// TODO: Rename to navigateWorkflowTo
export function advanceWorkflowLevelTo(config, level, newValue) {
  // TODO: this function requires there be a "nextLevel" property on the configuration. Instead it should set the requested depth to a newValue. Essentially replace level with depth

  // Error catching: if we went past the end of a list, don't keep advancing
  if (!config) {
    return false;
  }

  if (config["nextLevel"] === level) {
    config.index = newValue;
  } else if (config.children) {
    return { ...advanceWorkflowLevelTo(config.children[config.index]) };
  }
}

// TODO: this overwrites when things are logged multiple times, it should at the very least warn when that happens.
// TODO: Logs should instead be placed into an array on the task object called logs
// TODO: log and logAction do essentially the same thing.

// TODO: I can make this function nicer by doing something like:

/*




Then modify task does essentially the same thing as log does now except replacing an entire task object. 

logAction can be essentially identical after that. Although after the changes to logs I might not even need to separate them.

*/

export function log(config, key, value, withTimeStamp) {
  if (experimentComplete(config)) {
    console.error("Attempting to log when the experiment is complete.");
    return;
  }
  let index = config[__INDEX__] || getLeafIndex([0], config);

  let newTask = { ...getConfigAtIndex(index, config) };
  // TODO: Change the way we do configs.
  // newTask.logs = [...newTask.logs, newLog]

  if (withTimeStamp) {
    newTask[key] = {
      value: value,
      timestamp: Date.now()
    };
  } else {
    newTask[key] = value;
  }

  modifyConfig(index, config, newTask);
}

export function logAction(config, action) {
  if (experimentComplete(config)) {
    console.error("Attempting to log when the experiment is complete.");
    return;
  }
  let index = config[__INDEX__] || getLeafIndex([0], config);

  let newTask = { ...getConfigAtIndex(index, config) };
  // TODO: Change the way we do configs.
  // newTask.logs = [...newTask.logs, newLog]

  if (!newTask.actions) {
    newTask.actions = [];
  }
  newTask.actions = [
    ...newTask.actions,
    {
      action: action,
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

export const withRawConfiguration = connect(state => {
  return { configuration: state.Configuration };
});
