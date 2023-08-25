import { throttle, isEmpty } from "lodash-es";
import React, {
  useState,
  createContext,
  useContext,
  useCallback,
  ElementType,
  useMemo,
  useEffect,
} from "react";

import { serializeError } from "serialize-error";
import TaskRenderer from "./TaskRenderer.js";

import {
  advanceConfiguration,
  logToConfiguration,
  modifyConfiguration,
  Configuration,
  ExperimentIndex,
  UnfilledLog,
  experimentComplete,
  getCurrentIndex,
  TypedConfiguration,
} from "@hcikit/workflow";

import GridLayout from "../GridLayout.js";

import { ErrorBoundary, FallbackProps } from "react-error-boundary";
import { CenteredNicePaper } from "../components/index.js";

type PropsOfDict<T extends Record<string, React.ComponentType<any>>> = {
  [Task in keyof T]: React.ComponentProps<T[Task]>;
};

export type ConfigurationReact<
  T extends Record<string, React.ComponentType<any>>,
> = TypedConfiguration<PropsOfDict<T>>;

export interface ControlFunctions {
  advance: (index?: ExperimentIndex) => void;
  log: (log: UnfilledLog) => void;
  modify: (
    modifiedConfig: Record<string, unknown>,
    index?: ExperimentIndex
  ) => void;
}

export const ConfigContext = createContext<Configuration | undefined>(
  undefined
);

export const ConfigMutatorContext = createContext<ControlFunctions | undefined>(
  undefined
);

function useConfiguration(): Configuration {
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

export { useConfiguration, useExperiment };

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
  ErrorHandler?: React.ComponentType<FallbackProps>;
  forceRemountEveryTask?: boolean;
}> = ({
  saveState = saveStateToSessionStorage,
  loadState = loadStateFromSessionStorage,
  tasks,
  Layout = GridLayout,
  ErrorHandler = DefaultErrorHandler,
  forceRemountEveryTask,
  configuration,
}) => {
  // TODO: not sure how to create different sessions for the same task. The issue is that they'll be overwritten by the other thing. Maybe we can add a config version or session key or something to it?
  // TODO: using config and configuration is so confusing...
  const [config, setConfig] = useState<Configuration>(() => {
    let initialConfig = configuration || {};
    if (process.env.NODE_ENV !== "development" && loadState) {
      initialConfig = loadState() || configuration;
    }

    initialConfig = advanceConfiguration(
      initialConfig,
      getCurrentIndex(initialConfig)
    );

    return initialConfig;
  });

  // it might be better to do this as we save state rather than waiting a render, I chose this way because it is easier to implement than adding it to each of the modifying functions below.
  // useEffect(() => {
  //   if (saveState) {
  //     saveState(config);
  //     console.log("saving");
  //   }
  // }, [config, saveState]);

  const advance = useCallback(
    (index?: ExperimentIndex) =>
      setConfig((c: Configuration) => {
        c = logToConfiguration(c, { type: "END" });
        c = advanceConfiguration(c, index);

        if (!experimentComplete(c)) {
          c = logToConfiguration(c, { type: "START" });
        }

        saveState?.(c);

        return c;
      }),
    [saveState]
  );

  const log = useCallback(
    (log: UnfilledLog): void =>
      setConfig((c: Configuration) => {
        const newConfig: Configuration = logToConfiguration(c, log);

        saveState?.(c);

        return newConfig;
      }),
    [saveState]
  );

  const modify = useCallback(
    (modifiedConfig: Record<string, unknown>, index?: ExperimentIndex): void =>
      setConfig((c: Configuration) => {
        const newConfig = modifyConfiguration(c, modifiedConfig, index);

        saveState?.(c);

        return newConfig;
      }),
    [saveState]
  );

  // Kent says this is actually slower than just recreating it... But honestly idk if I trust that. Truth is I should test it, but this does solve the problem of unnecessary rerenders.

  const experiment = useMemo(
    () => ({
      advance: advance,
      log,
      modify,
    }),
    [advance, log, modify]
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
        <ErrorBoundary
          onError={(error, info) =>
            log({
              type: "ERROR",
              ...serializeError(info),
              ...serializeError(error),
            })
          }
          FallbackComponent={ErrorHandler}
        >
          <Layout>
            {!experimentComplete(config) ? (
              <TaskRenderer
                tasks={tasks}
                forceRemountEveryTask={forceRemountEveryTask}
              />
            ) : (
              <div style={{ gridArea: "task" }}>
                <CenteredNicePaper>
                  <h2>You&apos;ve completed the experiment!</h2>
                  <a
                    download={`${config.participant || "log"}.json`}
                    href={`data:text/json;charset=utf-8,${encodeURIComponent(
                      JSON.stringify(config)
                    )}`}
                  >
                    Download experiment log
                  </a>
                </CenteredNicePaper>
              </div>
            )}
          </Layout>
        </ErrorBoundary>
      </ConfigContext.Provider>
    </ConfigMutatorContext.Provider>
  );
};

const DefaultErrorHandler: React.FunctionComponent<FallbackProps> = ({
  error,
}) => {
  const configuration = useConfiguration();
  return (
    <CenteredNicePaper>
      <div style={{ gridArea: "task" }}>
        <h2>An error occurred in the experiment.</h2>
        <p style={{ fontStyle: "italic" }}>
          ({error.name}: {error.message})
        </p>
        <br />

        <a
          download={`${configuration.participant || "log"}.json`}
          href={`data:text/json;charset=utf-8,${encodeURIComponent(
            JSON.stringify(configuration)
          )}`}
        >
          Download experiment log
        </a>
      </div>
    </CenteredNicePaper>
  );
};

export default Experiment;
