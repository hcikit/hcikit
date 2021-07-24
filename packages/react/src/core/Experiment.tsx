import { throttle, isEmpty } from "lodash";
import React, {
  useState,
  createContext,
  useContext,
  useCallback,
  ElementType,
  useMemo,
  useEffect,
} from "react";

import TaskRenderer from "./TaskRenderer";

import {
  advanceConfiguration,
  logToConfiguration,
  modifyConfiguration,
  Configuration,
  ExperimentIndex,
  UnfilledLog,
  experimentComplete,
} from "@hcikit/workflow";

export interface ControlFunctions {
  advance: (index?: ExperimentIndex) => void;
  log: (log: UnfilledLog) => void;
  modifyConfig: (
    modifiedConfig: Record<string, unknown>,
    index?: ExperimentIndex
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

  const advance = useCallback(
    (index?: ExperimentIndex) =>
      setConfig((c: Configuration) => {
        // TODO: need to make the experiment log before and after

        c = logToConfiguration(c, { type: "END" });
        c = advanceConfiguration(c, index);

        if (!experimentComplete(c)) {
          c = logToConfiguration(c, { type: "START" });
        }

        if (saveState) {
          saveState(c);
        }

        return c;
      }),
    [saveState]
  );

  const log = useCallback(
    (log: UnfilledLog): void =>
      setConfig((c: Configuration) => {
        const newConfig: Configuration = logToConfiguration(c, log);

        if (saveState) {
          saveState(newConfig);
        }

        return newConfig;
      }),
    [saveState]
  );

  const modifyConfig = useCallback(
    (modifiedConfig: Record<string, unknown>, index?: ExperimentIndex): void =>
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
      advance: advance,
      log,
      modifyConfig,
    }),
    [advance, log, modifyConfig]
  );

  useEffect(() => {
    experiment.log({ type: "START" });
    // This is on purpose, we actually never want to rerun this. But also experiment should never actually change.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
