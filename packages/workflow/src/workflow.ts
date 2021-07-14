import { mergeWith, pickBy, isEqual, pick } from "lodash";

export type ExperimentIndex = Array<number>;

interface LogRequired {
  timestamp: number;
}

export type Log = LogRequired & Record<string, unknown>;

export const __INDEX__ = "__INDEX__";

interface ConfigurationRequired<T> {
  [__INDEX__]?: ExperimentIndex;
  children?: Array<Configuration<T>>;

  task?: keyof T | string;
  tasks?: Array<keyof T | string>;

  logs?: Array<Log>;
}

export type Configuration<T = Record<string, unknown>> =
  ConfigurationRequired<T> &
    Partial<Record<keyof T, unknown>> &
    Record<string, unknown>;

// TODO: mergeWith is very slow which slows everything down with lots of onlogs.
// TODO: should this work with a config with no children? Does it work with no children?
// TODO: some of these functions I can maybe use generators to reduce computation and make things faster?
// TODO: some of these should definitely be immutable but aren't... I'd rather everything here is immutable

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
): Record<string, unknown> {
  return merge(
    pickBy(props, (_: unknown, k: string) => k[0] === k[0].toLowerCase()),
    props[task] as Record<string, unknown>
  );
}

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

/**
 * This function reads the index of the configuration and outputs the current props for it.
 * If there is no index it assumes the experiment is just beginning.
 *
 * @param {Configuration} configuration
 * @returns the props for the current index of an experiment
 */
export function getCurrentProps(configuration: Configuration): Configuration {
  return getPropsFor(getCurrentIndex(configuration), configuration);
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
  index: ExperimentIndex,
  configuration: Configuration,
  deleteLogs = true
): Record<string, unknown> {
  if (experimentComplete(configuration)) {
    return {};
  }

  let props: Configuration = {};

  index = getLeafIndex(index, configuration);

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

/**
 * Traverses down the tree to the requested index and then returns the config at that index.
 *
 * @param {ExperimentIndex} index
 * @param {Configuration} initialConfig
 * @returns {Configuration} the requested level of config
 */
export function getConfigAtIndex(
  index: ExperimentIndex,
  initialConfig: Configuration
): Configuration {
  return (
    index.reduce<Configuration | undefined>((config, value) => {
      return config?.children?.[value];
    }, initialConfig) || {}
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
  index: ExperimentIndex,
  configuration: Configuration
): ExperimentIndex {
  if (index.length === 0) {
    return index;
  }

  index = [...index];

  while ("children" in getConfigAtIndex(index, configuration)) {
    index.push(0);
  }

  return index;
}

/**
 * Returns the next leaf index after this task is complete. The function is slightly misnamed because it doesn't actually change any indices.
 *
 * @param {Configuration} configuration
 * @returns {ExperimentIndex}
 */
export function markTaskComplete(
  configuration: Configuration
): ExperimentIndex {
  if (experimentComplete(configuration)) {
    return [];
  }

  let index = getCurrentIndex(configuration);

  index = getLeafIndex(index, configuration);

  let newIndexValue;

  do {
    const nextIndexValue = index.pop();

    if (nextIndexValue === undefined) {
      break;
    }

    newIndexValue = 1 + nextIndexValue;
    const currentChildren = getConfigAtIndex(index, configuration).children;

    if (!currentChildren) {
      console.error(
        "Error advancing task. The config has changed or something went wrong"
      );
      return getCurrentIndex(configuration);
    }

    if (newIndexValue < currentChildren.length) {
      index.push(newIndexValue);
      break;
    }
  } while (index.length);

  return getLeafIndex(index, configuration);
}

/**
 * This function actually places a new log object on the config at the current index, or if the index isn't a leaf it finds the leaf index.
 *
 * @param {Configuration} config
 * @param {Log | any} log
 * @returns
 */
export function logToConfig(config: Configuration, log: unknown): void {
  if (experimentComplete(config)) {
    console.error("Attempting to log when the experiment is complete.");
    return;
  }

  const index = config[__INDEX__] || getLeafIndex([0], config);

  if (typeof log !== "object") {
    log = { value: log };
  }

  modifyConfiguration(
    config,
    {
      logs: [
        ...(getConfigAtIndex(index, config).logs || []),
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
 * @param {Configuration} config
 * @param {ExperimentIndex} index
 * @param {Object} modifiedConfig
 * @param {boolean} logResult
 */
export function modifyConfiguration(
  config: Configuration,
  modifiedConfig: Record<string, unknown>,
  index: ExperimentIndex,
  logResult = true
): void {
  // if (index.length === 0) {
  //   // TODO: should log an error or something here
  //   console.error(
  //     "Attempted to modify an experiment that was already complete."
  //   );
  //   return;
  // }

  // TODO: this should maybe fail on completed experiments because it cannot log properly.

  const originalConfig = config;

  if (logResult) {
    const configToEdit = getConfigAtIndex(index, config);

    logToConfig(originalConfig, {
      from: pick(configToEdit, Object.keys(modifiedConfig)),
      to: modifiedConfig,
      index,
      eventType: "CONFIG_MODIFICATION",
    });
  }

  for (let i = 0; i < index.length; i++) {
    const nextLevelIndex = index[i];

    if (!config.children) {
      console.error(
        "There was an error modifying the config, the index did not exist."
      );
      return;
    }

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

function getCurrentIndex(config: Configuration): ExperimentIndex {
  let index: ExperimentIndex = [0];

  const myInd: ExperimentIndex | undefined = config[__INDEX__];

  if (myInd !== undefined) {
    index = [...myInd];
  }

  return index;
}
/**
 *
 * Edits a config by adding all of newConfig values at a certain depth. Depth works like slice (negative values start from the end, positive from the start)
 *
 * @param {Configuration} config
 * @param {Object} newConfig The key/values to overwrite
 * @param {number} depth the depth where 0 is the root, negative numbers work from the current config upwards (-1 being one up from the current position, and positive numbers move downwards). Not passing a depth results in the current level being edited
 */
export function modifyConfigurationAtDepth(
  config: Configuration,
  newConfig: Record<string, unknown>,
  depth?: number
): void {
  if (experimentComplete(config)) {
    console.error(
      "Attempting to modify config when the experiment is complete."
    );
    return;
  }

  let index = getCurrentIndex(config);

  index = getLeafIndex(index, config);

  const indexToEdit: ExperimentIndex = index.slice(0, depth);

  modifyConfiguration(config, newConfig, indexToEdit);
}

/**
 * Takes an index and tells us what task number it is. This is useful for progress bars.
 * One trick to using this is we can truncate a config and just take one of the children, then
 * that gives us the progress within a certain section of an experiment.
 * @param {Configuration} config
 * @param {ExperimentIndex} index
 * @returns {number}
 */
export function indexToTaskNumber(
  config: Configuration,
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

    const searchingConfig = getConfigAtIndex(searchingIndex, config);

    if (searchingConfig.children) {
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

  return -1;
}

/**
 * Takes a task number and returns an index. This is useful for dev tools because it can let us
 * move forward in the experiment.
 * @param {Configuration} config
 * @param {number} taskNumber
 * @returns {ExperimentIndex}
 */
export function taskNumberToIndex(
  config: Configuration,
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

    const searchingConfig = getConfigAtIndex(searchingIndex, config);

    if (searchingConfig.children) {
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

  return [];
}

export function getTotalTasks(config: Configuration): number {
  // TODO: this can be replaced with iterate config maybe? Could be a one liner, just iterateConfig then return the length of it.
  let tasks = 0;
  const toSearch: Array<ExperimentIndex> = [[]];

  while (toSearch.length > 0) {
    const searchingIndex = toSearch.pop();

    if (searchingIndex === undefined) {
      break;
    }

    const searchingConfig = getConfigAtIndex(searchingIndex, config);

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

// TODO: why is this even a generator... This is silly it adds so much complexity, it should just return all of the indices. I guess the upside is for searches. If it is a generator we can just search until we found something, which is really nice for some cases.
// TODO: maybe this function should just return all of the indices?
export function* iterateConfig(
  config: Configuration
): Generator<ExperimentIndex> {
  const toSearch: Array<ExperimentIndex> = [[]];

  while (toSearch.length > 0) {
    const searchingIndex = toSearch.pop();

    if (searchingIndex === undefined) {
      break;
    }

    const searchingConfig = getConfigAtIndex(searchingIndex, config);

    if (searchingConfig.children) {
      for (let i = searchingConfig.children.length - 1; i >= 0; i--) {
        toSearch.push([...searchingIndex, i]);
      }
    } else {
      yield searchingIndex;
    }
  }

  return;
}

// TODO: I think these functions are the same...
export function iterateConfigWithProps(
  config: Configuration
): Array<Record<string, unknown>> {
  return Array.from(iterateConfig(config)).map((index) =>
    getPropsFor(index, config)
  );
}

export function flatten(config: Configuration): Array<Record<string, unknown>> {
  return Array.from(iterateConfig(config)).map((index) =>
    getPropsFor(index, config, false)
  );
}
