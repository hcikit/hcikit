import { throttle, isEmpty } from "lodash-es";
import React, { useState, createContext, useContext, useCallback } from "react";
import PropTypes from "prop-types";

import TaskRenderer from "./TaskRenderer";
import {
  __INDEX__,
  markTaskComplete,
  logToConfig,
  modifyConfiguration,
  modifyConfigurationAtDepth,
  Configuration,
} from "@hcikit/workflow";

const ConfigContext = createContext();
const ConfigMutatorContext = createContext();

function useConfig(): Configuration {
  const context = useContext(ConfigContext);
  if (context === undefined) {
    throw new Error("useConfig must be used within a ConfigProvider");
  }
  return context;
}

function useExperiment() {
  const context = useContext(ConfigMutatorContext);
  if (context === undefined) {
    throw new Error("useConfig must be used within a ConfigMutatorContext");
  }
  return context;
}

export { useConfig, useExperiment };

const STATE_KEY = "HCIKIT_LOGS";

export const loadStateFromSessionStorage = () => {
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

export const saveStateToSessionStorage = throttle((state) => {
  try {
    window.sessionStorage.setItem(STATE_KEY, JSON.stringify(state));
  } catch (err) {
    console.error("Failed to save to sessionStorage", err);
  }
}, 3000);

// TODO: I never call savestate.
let Experiment = ({
  saveState = saveStateToSessionStorage,
  loadState = loadStateFromSessionStorage,
  ...props
}) => {
  // TODO: maybe we should hide the task registry and instead just pass a list of objects?
  // TODO: not sure how to create different sessions for the same task.

  let [config, setConfig] = useState(() => {
    let storedState = {};

    if (process.env.NODE_ENV !== "development" && loadState) {
      storedState = loadState();
    }

    // TODO: do we really wanna merge the two objects?
    return { ...(props.configuration || {}), ...storedState };
  });

  // // TODO: it might be better to do this as we save state rather than waiting a render, I chose this way because it is easier to implement than adding it to each of the modifying functions below.
  // useEffect(() => {
  //   if (saveState) {
  //     saveState(config);
  //     console.log("saving");
  //   }
  // }, [config, saveState]);

  // TODO: I can use usecallback here if I want.
  const taskComplete = useCallback(
    () =>
      setConfig((c) => {
        let newConfig = { ...c, [__INDEX__]: markTaskComplete(c) };

        if (saveState) {
          saveState(newConfig);
        }

        return newConfig;
      }),
    [saveState]
  );

  const setWorkflowIndex = useCallback(
    (newIndex) =>
      setConfig((c) => {
        let newConfig = { ...c, [__INDEX__]: newIndex };

        if (saveState) {
          saveState(newConfig);
        }

        return newConfig;
      }),
    [saveState]
  );

  const log = useCallback(
    (log) =>
      setConfig((c) => {
        let newConfig = { ...c };
        logToConfig(newConfig, log);

        if (saveState) {
          saveState(newConfig);
        }

        return newConfig;
      }),
    [saveState]
  );

  const modifyConfigAtDepth = useCallback(
    (modifiedConfig, depth) =>
      setConfig((c) => {
        let newConfig = { ...c };
        modifyConfigurationAtDepth(newConfig, modifiedConfig, depth);

        if (saveState) {
          saveState(newConfig);
        }

        return newConfig;
      }),
    [saveState]
  );

  const modifyConfig = useCallback(
    (index, modifiedConfig) =>
      setConfig((c) => {
        let newConfig = { ...c };
        modifyConfiguration(newConfig, modifiedConfig, index);

        if (saveState) {
          saveState(newConfig);
        }

        return newConfig;
      }),
    [saveState]
  );

  let experiment = {
    taskComplete,
    setWorkflowIndex,
    log,
    modifyConfigAtDepth,
    modifyConfig,
  };

  // NOTE: you *might* need to memoize this value
  // Learn more in http://kcd.im/optimize-context

  if (isEmpty(config)) {
    return null;
  }

  // TODO: the ...props is a decidedly bad idea to be honest. Maybe some things like the layout belong outside the experiment?
  return (
    <ConfigMutatorContext.Provider value={experiment}>
      <ConfigContext.Provider value={config}>
        <TaskRenderer {...props} />
      </ConfigContext.Provider>
    </ConfigMutatorContext.Provider>
  );
};

Experiment.propTypes = {
  configuration: PropTypes.object.isRequired,
  loadState: PropTypes.func,
  saveState: PropTypes.func,
  tasks: PropTypes.objectOf(PropTypes.elementType),
};

export default Experiment;
