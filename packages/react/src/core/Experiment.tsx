import { throttle, isEmpty } from "lodash";
import React, {
  useState,
  createContext,
  useContext,
  useCallback,
  ElementType,
  useMemo,
} from "react";

import TaskRenderer from "./TaskRenderer";

import {
  __INDEX__,
  markTaskComplete,
  logToConfig,
  modifyConfiguration,
  modifyConfigurationAtDepth,
  Configuration,
  ExperimentIndex,
} from "@hcikit/workflow";

export interface ControlFunctions {
  taskComplete: () => void;
  setWorkflowIndex: (index: ExperimentIndex) => void;
  log: (log: unknown) => void;
  modifyConfigAtDepth: (
    modifiedConfig: Record<string, unknown>,
    depth?: number | undefined
  ) => void;
  modifyConfig: (
    index: ExperimentIndex,
    modifiedConfig: Record<string, unknown>
  ) => void;
}

const ConfigContext = createContext<Configuration | undefined>(undefined);
export const ConfigMutatorContext = createContext<ControlFunctions | undefined>(
  undefined
);

function useConfig(): Configuration {
  const context = useContext(ConfigContext);
  if (context === undefined) {
    throw new Error("useConfig must be used within a ConfigProvider");
  }
  return context;
}

function useExperiment(): ControlFunctions {
  const context = useContext(ConfigMutatorContext);

  if (context === undefined) {
    throw new Error("useConfig must be used within a ConfigMutatorContext");
  }

  return context;
}

export { useConfig, useExperiment };

const STATE_KEY = "HCIKIT_LOGS";

export const loadStateFromSessionStorage = (): Configuration | undefined => {
  try {
    const state = window.sessionStorage.getItem(STATE_KEY);
    if (state) {
      return JSON.parse(state);
    }
  } catch (err) {
    console.error("Failed to load from sessionStorage", err);
  }

  return undefined;
};

export const saveStateToSessionStorage = throttle((state: Configuration) => {
  try {
    window.sessionStorage.setItem(STATE_KEY, JSON.stringify(state));
  } catch (err) {
    console.error("Failed to save to sessionStorage", err);
  }
}, 3000);

const Experiment: React.FunctionComponent<{
  saveState?: ((config: Configuration) => void) | null;
  loadState?: (() => Configuration) | null;
  configuration: Configuration;
  tasks: Record<string, ElementType>;
  Layout?: ElementType;
  ErrorHandler?: ElementType;
  forceRemountEveryTask?: boolean;
}> = ({
  saveState = saveStateToSessionStorage,
  loadState = loadStateFromSessionStorage,
  tasks,
  Layout,
  ErrorHandler,
  forceRemountEveryTask,
  configuration,
}) => {
  // TODO: not sure how to create different sessions for the same task.

  const [config, setConfig] = useState<Configuration>(() => {
    let storedState: Configuration = {};

    if (process.env.NODE_ENV !== "development" && loadState) {
      const attemptedStoredState: Configuration | undefined = loadState();

      if (attemptedStoredState) {
        storedState = attemptedStoredState;
      }
    }

    // TODO: do we really wanna merge the two objects?
    return { ...(configuration || {}), ...storedState };
  });

  // TODO: it might be better to do this as we save state rather than waiting a render, I chose this way because it is easier to implement than adding it to each of the modifying functions below.
  // useEffect(() => {
  //   if (saveState) {
  //     saveState(config);
  //     console.log("saving");
  //   }
  // }, [config, saveState]);

  const taskComplete = useCallback(
    () =>
      setConfig((c: Configuration) => {
        // TODO: push the ...c into the library? deepfreeze it in all tests
        const newConfig: Configuration = {
          ...c,
          [__INDEX__]: markTaskComplete(c),
        };

        if (saveState) {
          saveState(newConfig);
        }

        return newConfig;
      }),
    [saveState]
  );

  const setWorkflowIndex = useCallback(
    (newIndex: ExperimentIndex): void =>
      setConfig((c: Configuration) => {
        const newConfig: Configuration = { ...c, [__INDEX__]: newIndex };

        if (saveState) {
          saveState(newConfig);
        }

        return newConfig;
      }),
    [saveState]
  );

  const log = useCallback(
    (log: unknown): void =>
      setConfig((c: Configuration) => {
        const newConfig: Configuration = { ...c };
        logToConfig(newConfig, log);

        if (saveState) {
          saveState(newConfig);
        }

        return newConfig;
      }),
    [saveState]
  );

  const modifyConfigAtDepth = useCallback(
    (
      modifiedConfig: Record<string, unknown>,
      depth?: number | undefined
    ): void =>
      setConfig((c: Configuration) => {
        const newConfig: Configuration = { ...c };
        modifyConfigurationAtDepth(newConfig, modifiedConfig, depth);

        if (saveState) {
          saveState(newConfig);
        }

        return newConfig;
      }),
    [saveState]
  );

  const modifyConfig = useCallback(
    (index: ExperimentIndex, modifiedConfig: Record<string, unknown>): void =>
      setConfig((c: Configuration) => {
        const newConfig: Configuration = { ...c };
        modifyConfiguration(newConfig, modifiedConfig, index);

        if (saveState) {
          saveState(newConfig);
        }

        return newConfig;
      }),
    [saveState]
  );

  // Kent says this is actually slower than just recreating it... But honestly idk if I trust that. Truth is I should test it, but this does solve the problem of unnecessary rerenders.

  const experiment = useMemo(
    () => ({
      taskComplete,
      setWorkflowIndex,
      log,
      modifyConfigAtDepth,
      modifyConfig,
    }),
    [taskComplete, setWorkflowIndex, log, modifyConfigAtDepth, modifyConfig]
  );

  // NOTE: you *might* need to memoize this value
  // Learn more in http://kcd.im/optimize-context

  if (isEmpty(config)) {
    return null;
  }

  return (
    <ConfigMutatorContext.Provider value={experiment}>
      <ConfigContext.Provider value={config}>
        <TaskRenderer
          tasks={tasks}
          forceRemountEveryTask={forceRemountEveryTask}
          Layout={Layout}
          ErrorHandler={ErrorHandler}
        />
      </ConfigContext.Provider>
    </ConfigMutatorContext.Provider>
  );
};

export default Experiment;
