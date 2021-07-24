import { mergeWith, pickBy, isEqual, pick, sortedIndex } from "lodash";

export type ExperimentIndex = Array<number>;

export type Log = {
  timestamp: number;
  type: string;
  [k: string]: unknown;
};

type Omit2<T, Key extends keyof T> = {
  [K in keyof T as K extends Key ? never : K]: T[K];
};

export type UnfilledLog = Omit2<Log, "timestamp">;

export const __INDEX__ = "__INDEX__";

// TODO: can I make task required? Or at least one of task or tasks required.
interface ConfigurationRequired<
  T extends Record<string, unknown> = Record<string, unknown>
> {
  [__INDEX__]?: ExperimentIndex;
  // eslint-disable-next-line no-use-before-define
  children?: Array<Configuration<T>>;

  task?: keyof T | string;
  tasks?: Array<keyof T | string>;

  logs?: Array<Log>;
}

export type Configuration<
  T extends Record<string, unknown> = Record<string, unknown>
> = ConfigurationRequired<T> &
  Partial<Record<keyof T, unknown>> &
  Record<string, unknown>;

// TODO: should this work with a config with no children? Does it work with no children?
// TODO: some of these functions I can maybe use generators to reduce computation and make things faster?
// TODO: some of these should definitely be immutable but aren't... I'd rather everything here is immutable
// TODO: would be nice if the order was consistent. Lodash always puts the object in question first. Following that pattern seems reasonable.

// TODO: everything should be configuration or config. pick one.

// ----- Whole configuration ------

/**
 * Given a configuration, determines whether the experiment is complete or not.
 *
 * @param {Configuration} configuration
 * @returns {boolean} indicates whether an experiment is complete or not.
 */
// TODO: change boolean to something like
export function experimentComplete(configuration: Configuration): boolean {
  return configuration[__INDEX__]?.length === 0;
}

export function getTotalTasks(configuration: Configuration): number {
  // TODO: this can be replaced with iterate config maybe? Could be a one liner, just iterateConfig then return the length of it.
  let tasks = 0;
  const toSearch: Array<ExperimentIndex> = [[]];

  while (toSearch.length > 0) {
    const searchingIndex = toSearch.pop();

    if (searchingIndex === undefined) {
      break;
    }

    const searchingConfig = getConfigurationAtIndex(
      configuration,
      searchingIndex
    );

    if (searchingConfig.children) {
      for (let i = searchingConfig.children.length - 1; i >= 0; i--) {
        toSearch.push([...searchingIndex, i]);
      }
    } else {
      tasks++;
    }
  }

  return tasks;
}

// ------- PROPS -------

/**
 * Finds all of the props for a given task based on which ones start with a lowercase value
 * and then also the ones that match the task name (which must start with a capital letter).
 *
 * @param {Object} props
 * @param {string} task
 * @returns an object containing all of the props for a given task
 */
// eslint-disable-next-line @typescript-eslint/ban-types
export function scopePropsForTask(
  props: Record<string, unknown>,
  task: string
): Configuration {
  return merge(
    pickBy(props, (_: unknown, k: string) => k[0] === k[0].toLowerCase()),
    props[task] as Record<string, unknown>
  );
}

/**
 * This function reads the index of the configuration and outputs the current props for it.
 * If there is no index it assumes the experiment is just beginning.
 *
 * @param {Configuration} configuration
 * @returns the props for the current index of an experiment
 */
export function getCurrentProps(configuration: Configuration): Configuration {
  return getPropsFor(configuration, getCurrentIndex(configuration));
}

// TODO: should throw an error if it is out of range.
/**
 * Gets the props for an experiment with a given index.
 *
 * @param {ExperimentIndex} index
 * @param {Configuration} configuration
 * @param {boolean} deleteLogs whether to include the logs or not.
 * @returns the props for a given index on a configuration.
 */
export function getPropsFor(
  configuration: Configuration,
  index: ExperimentIndex,
  deleteLogs = true
): Configuration {
  if (experimentComplete(configuration)) {
    return {};
  }

  let props: Configuration = {};

  index = getLeafIndex(configuration, index);

  // Loop over every level of the index, collecting the props from that level at every step.
  // We work our way down from the top in order to let properties override each other,
  // More specific props override other ones.
  for (const nextLevelIndex of index) {
    const properties = Object.assign({}, configuration);

    // We want to ignore the children props.
    delete properties.children;

    if (!configuration.children) {
      break;
    }

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

// ----- INDEX -----

/**
 * Traverses down the tree to the requested index and then returns the config at that index.
 *
 * @param {ExperimentIndex} index
 * @param {Configuration} initialConfiguration
 * @returns {Configuration} the requested level of config
 */
export function getConfigurationAtIndex(
  initialConfiguration: Configuration,
  index: ExperimentIndex
): Configuration {
  return (
    index.reduce<Configuration | undefined>((config, value) => {
      return config?.children?.[value];
    }, initialConfiguration) || {}
  );
}

/**
 * Finds the nearest leaf index to a starting index by traversing down the tree and always choosing
 * the first child.
 * @param {ExperimentIndex} index
 * @param {Configuration} configuration
 * @returns {ExperimentIndex} the nearest leaf index.
 */
export function getLeafIndex(
  configuration: Configuration,
  index: ExperimentIndex
): ExperimentIndex {
  if (index.length === 0) {
    return index;
  }

  index = [...index];

  while ("children" in getConfigurationAtIndex(configuration, index)) {
    index.push(0);
  }

  return index;
}

/**
 * This function is a helper function to get the current index, or if the experiment hasn't started it returns [0]
 *
 * @param {Configuration} configuration
 * @returns {ExperimentIndex} the current experiment index, or [0] if there is none.
 */
export function getCurrentIndex(configuration: Configuration): ExperimentIndex {
  // TODO: should this always return a leaf index? Could change it and see if it hurts anything?
  let index: ExperimentIndex = [0];

  const myInd: ExperimentIndex | undefined = configuration[__INDEX__];

  if (myInd !== undefined) {
    index = [...myInd];
  }

  return index;
}

/**
 * Takes an index and tells us what task number it is. This is useful for progress bars.
 * One trick to using this is we can truncate a config and just take one of the children, then
 * that gives us the progress within a certain section of an experiment.
 * @param {Configuration} configuration
 * @param {ExperimentIndex} index
 * @returns {number}
 */
export function indexToTaskNumber(
  configuration: Configuration,
  index: ExperimentIndex
): number {
  // TODO: this can be replaced with iterate config maybe?
  // TODO: maybe index can be converted to a leaf node
  let number = 0;
  const toSearch: Array<ExperimentIndex> = [[]];

  // Basically just do a depth first search until we find the correct index.
  // We can't know where the leaf nodes are so we need to search every node.
  while (toSearch.length !== 0) {
    const searchingIndex = toSearch.pop();

    if (searchingIndex === undefined) {
      break;
    }

    const searchingConfiguration = getConfigurationAtIndex(
      configuration,
      searchingIndex
    );

    if (searchingConfiguration.children) {
      for (let i = searchingConfiguration.children.length - 1; i >= 0; i--) {
        toSearch.push([...searchingIndex, i]);
      }
    } else {
      if (isEqual(searchingIndex, index)) {
        return number;
      }

      number++;
    }
  }

  return -1;
}

/**
 * Takes a task number and returns an index. This is useful for dev tools because it can let us
 * move forward in the experiment.
 * @param {Configuration} configuration
 * @param {number} taskNumber
 * @returns {ExperimentIndex}
 */
export function taskNumberToIndex(
  configuration: Configuration,
  taskNumber: number
): ExperimentIndex {
  // TODO: this can be replaced with iterate config maybe?
  let number = 0;
  const toSearch: Array<ExperimentIndex> = [[]];

  while (toSearch.length > 0) {
    const searchingIndex = toSearch.pop();

    if (searchingIndex === undefined) {
      break;
    }

    const searchingConfiguration = getConfigurationAtIndex(
      configuration,
      searchingIndex
    );

    if (searchingConfiguration.children) {
      for (let i = searchingConfiguration.children.length - 1; i >= 0; i--) {
        toSearch.push([...searchingIndex, i]);
      }
    } else {
      if (taskNumber === number) {
        return searchingIndex;
      }
      number++;
    }
  }

  return [];
}

// ------ Mutators ------

/**
 * Returns the next leaf index after this task is complete. The function is slightly misnamed because it doesn't actually change any indices.
 *
 * @param {Configuration} configuration
 * @returns {ExperimentIndex}
 */
export function advanceConfiguration(
  configuration: Configuration,
  index?: ExperimentIndex
): Configuration {
  if (experimentComplete(configuration)) {
    return configuration;
  }

  if (index !== undefined) {
    console.log("Uhhhh");
    return { ...configuration, [__INDEX__]: index };
  }

  index = getCurrentIndex(configuration);
  index = getLeafIndex(configuration, index);

  let newIndexValue;

  do {
    const nextIndexValue = index.pop();

    if (nextIndexValue === undefined) {
      break;
    }

    newIndexValue = 1 + nextIndexValue;
    const currentChildren = getConfigurationAtIndex(
      configuration,
      index
    ).children;

    if (!currentChildren) {
      throw new Error(
        "Error advancing task, the current index path doesn't exist."
      );
    }

    if (newIndexValue < currentChildren.length) {
      index.push(newIndexValue);
      break;
    }
  } while (index.length);

  return { ...configuration, [__INDEX__]: getLeafIndex(configuration, index) };
}

/**
 * This function actually places a new log object on the config at the current index, or if the index isn't a leaf it finds the leaf index.
 *
 * @param {Configuration} configuration
 * @param {Log | any} log
 * @returns
 */
// We use omit2 because Omit clobbers all of the stuff in it.
export function logToConfiguration(
  configuration: Configuration,
  log: UnfilledLog
): Configuration {
  if (experimentComplete(configuration)) {
    throw new Error("Attempting to log when the experiment is complete.");
  }

  const index = getCurrentIndex(configuration);

  return modifyConfiguration(
    configuration,
    {
      logs: [
        ...(getConfigurationAtIndex(configuration, index).logs || []),
        // eslint-disable-next-line @typescript-eslint/ban-types
        { ...(log as object), timestamp: Date.now() },
      ],
    },
    index,
    false
  );
}

/**
 * Takes the config and actually modifies something about it according to the modified config.
 * modifiedConfig is an object and all of the properties in it overwrite the current properties at the current leaf index.
 *
 * @param {Configuration} configuration
 * @param {ExperimentIndex} index
 * @param {Object} modifiedConfiguration
 * @param {boolean} logResult
 */
export function modifyConfiguration(
  configuration: Configuration,
  modifiedConfiguration: Record<string, unknown>,
  index?: ExperimentIndex,
  logResult = true
): Configuration {
  // if (index.length === 0) {
  //   // TODO: should log an error or something here
  //   console.error(
  //     "Attempted to modify an experiment that was already complete."
  //   );
  //   return;
  // }

  if (!index) {
    index = getCurrentIndex(configuration);
  }

  let originalConfiguration = { ...configuration };

  if (logResult) {
    const configToEdit = getConfigurationAtIndex(configuration, index);

    originalConfiguration = logToConfiguration(originalConfiguration, {
      from: pick(configToEdit, Object.keys(modifiedConfiguration)),
      to: modifiedConfiguration,
      index,
      type: "CONFIG_MODIFICATION",
    });
  }

  configuration = originalConfiguration;

  // Iterate downwards to find the part we want to modify.
  for (let i = 0; i < index.length; i++) {
    const nextLevelIndex = index[i];

    if (!configuration.children) {
      throw new Error(
        "There was an error modifying the config, the index did not exist."
      );
    }

    configuration.children = [
      ...configuration.children.slice(0, nextLevelIndex),
      {
        ...configuration.children[nextLevelIndex],
      },
      ...configuration.children.slice(nextLevelIndex + 1),
    ];

    configuration = configuration.children[nextLevelIndex];
  }

  // Modify the parts we actually want to modify
  Object.assign(configuration, modifiedConfiguration);

  return originalConfiguration;
}

// ----- Iterating configs -----

export function* iterateConfiguration(
  configuration: Configuration
): Generator<ExperimentIndex> {
  // This adds enough complexity it is questionable whether it should be a generator or not.
  const toSearch: Array<ExperimentIndex> = [[]];

  while (toSearch.length > 0) {
    const searchingIndex = toSearch.pop();

    if (searchingIndex === undefined) {
      break;
    }

    const searchingConfiguration = getConfigurationAtIndex(
      configuration,
      searchingIndex
    );

    if (searchingConfiguration.children) {
      for (let i = searchingConfiguration.children.length - 1; i >= 0; i--) {
        toSearch.push([...searchingIndex, i]);
      }
    } else {
      yield searchingIndex;
    }
  }
}

export function flattenConfigurationWithProps(
  configuration: Configuration
): Array<Record<string, unknown>> {
  return Array.from(iterateConfiguration(configuration)).map((index) =>
    getPropsFor(configuration, index, false)
  );
}

// TODO: mergeWith is very slow which slows everything down with lots of onlogs.
export function mergeArraysSpecial(
  object: Record<string, unknown>,
  source: Record<string, unknown>
): Record<string, unknown> {
  return mergeWith(object, source, (value: unknown, srcValue: unknown) => {
    if (Array.isArray(value)) {
      return srcValue;
    }
  });
}

const merge = mergeArraysSpecial;
