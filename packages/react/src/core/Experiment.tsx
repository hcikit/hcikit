import { isEmpty } from "lodash-es";
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
import { BasePersistence, StoragePersistence } from "../persistence/index.js";

import { Button, Typography, CircularProgress } from "@mui/material";
import { Task } from "../index.js";

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
  persistence?: BasePersistence | null;
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

function isPromise<T extends object>(obj: T | Promise<T>): obj is Promise<T> {
  return "then" in obj && typeof obj.then === "function";
}

const Experiment: React.FunctionComponent<{
  persistence?: BasePersistence | null;
  configuration: Configuration | Promise<Configuration>;
  tasks: Record<string, Task<any>>;
  Layout?: ElementType;
  ErrorHandler?: React.ComponentType<FallbackProps>;
  forceRemountEveryTask?: boolean;
  devOptions?: { persistInDevelopment: boolean; useIndexFromUrl: boolean };
}> = ({
  persistence = new StoragePersistence(window.sessionStorage, "HCIKIT_LOGS"),
  configuration: initialConfiguration,
  devOptions = { persistInDevelopment: false, useIndexFromUrl: true },
  ...props
}) => {
  const shouldPersistConfiguration =
    (process.env.NODE_ENV !== "development" ||
      devOptions.persistInDevelopment) &&
    persistence !== null;

  const [configurations, setConfigurations] = useState<{
    loadedConfiguration: Configuration | undefined;
    initialConfiguration: Configuration | undefined;
    doneLoadingPersisted: boolean;
    doneLoadingInitial: boolean;
  }>({
    loadedConfiguration: undefined,
    initialConfiguration: isPromise(initialConfiguration)
      ? undefined
      : initialConfiguration,
    doneLoadingPersisted: !shouldPersistConfiguration,
    doneLoadingInitial: !isPromise(initialConfiguration),
  });

  useEffect(() => {
    async function loadConfigs() {
      if (shouldPersistConfiguration) {
        persistence?.load().then((loadedConfig) => {
          setConfigurations((c) => ({
            ...c,
            loadedConfiguration: loadedConfig,
            doneLoadingPersisted: true,
          }));
        });
      }
      if (isPromise(initialConfiguration)) {
        initialConfiguration.then((loadedConfig) => {
          setConfigurations((c) => ({
            ...c,
            initialConfiguration: loadedConfig,
            doneLoadingInitial: true,
          }));
        });
      }
    }

    loadConfigs();
  }, []);

  if (
    !configurations.doneLoadingInitial ||
    !configurations.doneLoadingPersisted ||
    !configurations.initialConfiguration
  ) {
    return (
      <CenteredNicePaper>
        <Typography>Loading experiment configuration...</Typography>
        <br />
        <CircularProgress size={100} />
      </CenteredNicePaper>
    );
  } else {
    return (
      <ExperimentInner
        {...props}
        devOptions={devOptions}
        initialConfiguration={configurations.initialConfiguration}
        loadedConfiguration={configurations.loadedConfiguration}
        persistence={persistence}
      />
    );
  }
};

const ExperimentInner: React.FC<{
  persistence?: BasePersistence | null;
  initialConfiguration: Configuration;
  loadedConfiguration: Configuration | undefined;
  tasks: Record<string, Task>;
  Layout?: ElementType;
  ErrorHandler?: React.ComponentType<FallbackProps>;
  forceRemountEveryTask?: boolean;
  devOptions: { persistInDevelopment: boolean; useIndexFromUrl: boolean };
}> = ({
  persistence,
  tasks,
  Layout = GridLayout,
  ErrorHandler = DefaultErrorHandler,
  forceRemountEveryTask,
  initialConfiguration,
  loadedConfiguration,
  devOptions,
}) => {
  // TODO: not sure how to create different sessions for the same task. The issue is that they'll be overwritten by the other thing. Maybe we can add a config version or session key or something to it?
  // TODO: using config and configuration is so confusing...
  const [config, setConfig] = useState<Configuration>(() => {
    let configurationToUse: Configuration = initialConfiguration;

    if (
      loadedConfiguration &&
      (process.env.NODE_ENV !== "development" ||
        devOptions.persistInDevelopment)
    ) {
      configurationToUse = loadedConfiguration;
    }

    // This seems hacky. I think I am assigning the initial index to whatever it should be if the experiment just started, or assigning it to the proper one if we haven't started yet.
    configurationToUse = advanceConfiguration(
      configurationToUse,
      getCurrentIndex(configurationToUse)
    );

    return configurationToUse;
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
      setConfig((c) => {
        c = logToConfiguration(c, { type: "END" });
        c = advanceConfiguration(c, index);

        if (!experimentComplete(c)) {
          c = logToConfiguration(c, { type: "START" });
        }

        persistence?.saveThrottled(c);

        return c;
      }),
    [persistence]
  );

  const log = useCallback(
    (log: UnfilledLog): void =>
      setConfig((c) => {
        const newConfig: Configuration = logToConfiguration(c, log);

        persistence?.saveThrottled(c);

        return newConfig;
      }),
    [persistence]
  );

  const modify = useCallback(
    (modifiedConfig: Record<string, unknown>, index?: ExperimentIndex): void =>
      setConfig((c) => {
        const newConfig = modifyConfiguration(c, modifiedConfig, index);

        persistence?.saveThrottled(c);

        return newConfig;
      }),
    [persistence]
  );

  // Kent says this is actually slower than just recreating it... But honestly idk if I trust that. Truth is I should test it, but this does solve the problem of unnecessary rerenders.

  const experiment = useMemo(
    () => ({
      advance: advance,
      log,
      modify,
      persistence,
    }),
    [advance, log, modify]
  );

  useEffect(() => {
    experiment.log({ type: "START" });
    // This is on purpose, we actually never want to rerun this. But also experiment should never actually change.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    window.onbeforeunload = (e) => {
      persistence?.save(config);
      persistence?.flush();
      return "You have some unsaved changes";
    };
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
