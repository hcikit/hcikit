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
  markTaskComplete,
  logToConfig,
  modifyConfiguration,
  modifyConfigurationAtDepth,
  Configuration,
  ExperimentIndex,
  setIndexTo,
  UnfilledLog,
} from "@hcikit/workflow";

// Actually the functions for modifying the config are strange. It shouldn't be at depth, it should be at index. And then another one at the current index/.

export interface ControlFunctions {
  taskComplete: () => void;
  setWorkflowIndex: (index: ExperimentIndex) => void;
  log: (log: UnfilledLog) => void;
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
        // TODO: need to make the experiment log before and after
        // TODO: push the ...c into the library? deepfreeze it in all tests

        // logToConfig(c, { type: "END" });
        const newConfig: Configuration = markTaskComplete(c);
        // logToConfig(newConfig, { type: "START" });

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
        const newConfig: Configuration = setIndexTo(c, newIndex);

        if (saveState) {
          saveState(newConfig);
        }

        return newConfig;
      }),
    [saveState]
  );

  const log = useCallback(
    (log: UnfilledLog): void =>
      setConfig((c: Configuration) => {
        const newConfig: Configuration = logToConfig(c, log);

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
        const newConfig = modifyConfigurationAtDepth(c, modifiedConfig, depth);

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
        const newConfig = modifyConfiguration(c, modifiedConfig, index);

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

  // useEffect(() => {
  //   experiment.log({ type: "START" });
  //   // This is on purpose, we actually never want to rerun this. But also experiment should never actually change.
  //   // eslint-disable-next-line react-hooks/exhaustive-deps
  // }, []);

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
