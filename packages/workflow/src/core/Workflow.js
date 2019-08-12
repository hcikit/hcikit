import { connect } from "react-redux";
import { mergeWith, pickBy } from "lodash-es";

// TODO: mergeWith is very slow which slows everything down with lots of onlogs.
// TODO: there is a lot of duplication in here.
// TODO: need to document the frameworks use of index or rename it to something less commonly used because it gets deleted before passing it.

// TODO: to make it easier to test we should instead wrap all of the register task etc stuff into a class. If we do this properly it might help solve some issues with creating a replay thing.

let tasks = {};
let reducers = {};

export function mergeArraysSpecial(object, source) {
  return mergeWith(object, source, (value, srcValue) => {
    if (Array.isArray(value)) {
      return srcValue;
    }
  });
}

let merge = mergeArraysSpecial;

/**
 *
 * registerTask("MyTask", MyTask))
 *
 * @param {string} taskName, the name of the component for lookup in configuration
 * @param {function} task, the component

 */
export const registerTask = (taskName, task, reducer = undefined) => {
  tasks[taskName] = task;
  if (reducer) {
    reducers[taskName] = reducer;
  }
};

export const getReducers = () => reducers;

// TODO: consider using something that supports passing them in better, so that I can just pass a component in during a test without using workflow...
export const getTask = (taskName, currentProps = {}) => {
  if (typeof currentProps[taskName] === "string") {
    taskName = currentProps[taskName];
  }

  return tasks[taskName];
};

// TODO: these props are a mess, they're very expensive because we call them multiple times and they call each other.

export const getComponentProps = (task, configuration) => {
  return getCurrentProps(configuration)[task] || {};
};

export const getGlobalProps = configuration => {
  return pickBy(
    getCurrentProps(configuration),
    (_, k) => k[0] !== k[0].toUpperCase()
  );
};

export const getAllPropsForComponent = (task, configuration) => {
  return merge(
    getGlobalProps(configuration),
    getComponentProps(task, configuration)
  );
};

// An experiment configuration object looks like this (for example):
// let configuration = {
//   your_props: your_values,
//   current: {key: "sections", value: 0},
//   sections: [
//     {
//       your_section_props: your_values,
//       current: {key: "blocks", value: 0},
//       blocks: [
//         {
//           your_block_props: your_values,
//           current: {key: "trials", value: 0},
//           trials: [
//             {
//               your_trial_props: your_values,
//             },
//             {
//               your_trial_props: your_values,
//             }
//           ],
//         }
//       ],
//     }
//   ],
// }
//
// Each level of the configuration (except for the leaves) must have at least 2 elements:
// - current: Describes where the participant is in the experiment. Contains a key (the name of a list) and a value (the current index in the list).
// - current.key: A list of pieces of the experiment.
// All other props are provided as inputs to the experiment components.
// Props at the higher levels are overridden by props with the same name at lower levels. For example, a "speed" prop inside one of the "blocks" objects would take precedence over a "speed" prop in the "sections" object.

// TODO: Convert getcurrentprops into a "selector" function

// Get a flattened list of props for this trial of the experiment.
export function getCurrentProps(configuration, props = {}) {
  // Error catching: if we're finished the experiment, return undefined
  if (!configuration) {
    return undefined;
  }

  // Recursive case: return the union of the props at this level and the props at the next level
  // Prop values at this level are overwritten by values in the next level
  if ("children" in configuration) {
    const nextLevelIndex = configuration.index || 0;

    let properties = Object.assign({}, configuration);

    delete properties.nextLevel;
    delete properties.index;
    delete properties.children;

    properties = merge(props, properties);

    return getCurrentProps(configuration.children[nextLevelIndex], properties);
  } else {
    // Base case: return all of the props
    return merge(props, configuration);
  }
}

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

export const withConfigAsProps = connect(state => {
  let configuration = getCurrentProps(state.Configuration);
  return configuration;
});

export const withRawConfiguration = connect(state => {
  return { configuration: state.Configuration };
});
