import { connect } from "react-redux";
import { mergeWith, pickBy } from "lodash-es";

// TODO: mergeWith is very slow which slows everything down with lots of onlogs.
// TODO: there is a lot of duplication in here.
// TODO: need to document the frameworks use of index or rename it to something less commonly used because it gets deleted before passing it.

let __INDEX__ = "__INDEX__";

export function mergeArraysSpecial(object, source) {
  return mergeWith(object, source, (value, srcValue) => {
    if (Array.isArray(value)) {
      return srcValue;
    }
  });
}

let merge = mergeArraysSpecial;

// TODO: Convert getcurrentprops into a "selector" function
export function scopePropsForTask(props, task) {
  return merge(
    pickBy(props, (_, k) => k[0] === k[0].toLowerCase()),
    props[task]
  );
}

// Get a flattened list of props for this trial of the experiment.
export function getCurrentProps(configuration) {
  // TODO: this doesn't seem all that nice... but without it we just return the entire configuration which seems wrong...
  if (configuration.index >= configuration.children.length) {
    return {};
  }

  let props = {};

  while (configuration && "children" in configuration) {
    const nextLevelIndex = configuration.index || 0;
    let properties = Object.assign({}, configuration);

    // TODO: don't delete nextLevel
    delete properties.nextLevel;
    // TODO: name children and index using a constant instead.
    delete properties.index;
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
  let index = [0];
  if (configuration.index) {
    index = [...configuration.index];
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

  return index;
}

export function advanceWorkflowAtDepthBy() {}

// Move on to the next step of the workflow.
// Returns true if the participant has finished all the steps in this part of the configuration.
export function advanceWorkflow(config) {
  // Error catching: if we went past the end of a list, don't keep advancing
  if (!config) {
    return false;
  }

  // Recursive case: move through this level's stage list
  // If we reach the end, return true so that the level above this knows we're finished
  if ("children" in config) {
    const nextLevelIndex = config.index || 0;

    // If the next level index is already passed then we shouldn't continue
    if (nextLevelIndex < config.children.length) {
      config.children = [
        ...config.children.slice(0, nextLevelIndex),
        {
          ...config.children[nextLevelIndex]
        },
        ...config.children.slice(nextLevelIndex + 1)
      ];

      if (advanceWorkflow(config.children[nextLevelIndex])) {
        config.index = nextLevelIndex + 1;
        return config.index >= config.children.length;
      }
    }
  } else {
    // Base case: at a leaf node, we don't have a list of steps, so we're always done
    return true;
  }
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

let newTask = {...getTask([0,1,2])}
newTask.logs = [...newTask.logs, newLog]
modifyTask([0,1,2], newTask)


Then modify task does essentially the same thing as log does now except replacing an entire task object. 

logAction can be essentially identical after that. Although after the changes to logs I might not even need to separate them.

*/

export function log(config, key, value, withTimeStamp) {
  // Walk down the tree until we have reached the bottom, replacing each level to avoid mutations.

  if (config.index >= config.children.length) {
    console.error("Attempting to log when the experiment is complete.");
    return;
  }

  while ("children" in config) {
    const nextLevelIndex = config.index || 0;

    config.children = [
      ...config.children.slice(0, nextLevelIndex),
      {
        ...config.children[nextLevelIndex]
      },
      ...config.children.slice(nextLevelIndex + 1)
    ];
    config = config.children[nextLevelIndex];
  }
  if (withTimeStamp) {
    config[key] = {
      value: value,
      timestamp: Date.now()
    };
  } else {
    config[key] = value;
  }
}

export function logAction(config, action) {
  if (config.index >= config.children.length) {
    console.error("Attempting to log when the experiment is complete.");
    return;
  }

  while ("children" in config) {
    const nextLevelIndex = config.index || 0;

    config.children = [
      ...config.children.slice(0, nextLevelIndex),
      {
        ...config.children[nextLevelIndex]
      },
      ...config.children.slice(nextLevelIndex + 1)
    ];
    config = config.children[nextLevelIndex];
  }

  if (!config.actions) {
    config.actions = [];
  }
  config.actions = [
    ...config.actions,
    {
      action: action,
      timestamp: Date.now()
    }
  ];
}

// Flatten the experiment props down to a given level.
// Returns a list of all flattened configurations.
export function flattenToLevel(config, level) {
  if ("children" in config) {
    // Find our properties
    let properties = Object.assign({}, config);
    delete properties.children;
    delete properties.nextLevel;
    delete properties.index;

    // Get the flattened lists
    let flattenedConfigList;
    if (config.nextLevel === level) {
      // Base case: we're at the right level
      // Just grab the list of configs below us
      flattenedConfigList = config.children;
    } else {
      // Recursive case: go deeper
      flattenedConfigList = [];
      config.children.forEach(subConfig =>
        flattenedConfigList.push(...flattenToLevel(subConfig, level))
      );
    }

    // Apply our properties
    return flattenedConfigList.map(subConfig => {
      let propertiesClone = Object.assign({}, properties);
      return merge(propertiesClone, subConfig);
    });
  } else {
    // Edge case: we've run out of levels to flatten
    // Return a list with the entire config in it
    return [config];
  }
}

// BUG: this function breaks if any numbers are passed the point they should be
export const getCurrentIndex = config => {
  let index = [];

  if (config.index >= config.children.length) {
    return [];
  }

  while ("children" in config) {
    const nextLevelIndex = config.index || 0;
    index.push(nextLevelIndex);

    config = config.children[nextLevelIndex];
  }

  return index;
};

export const withRawConfiguration = connect(state => {
  return { configuration: state.Configuration };
});
