import { throttle } from "lodash-es";

import React, { useEffect, useState } from "react";
import { Provider } from "react-redux";
import PropTypes from "prop-types";

import TaskRenderer from "./core/App";
import configureStore from "./core/configureStore";
import TaskRegistry from "./core/TaskRegistry";

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

export const saveStateToSessionStorage = throttle(state => {
  try {
    window.sessionStorage.setItem(STATE_KEY, JSON.stringify(state));
  } catch (err) {
    console.error("Failed to save to sessionStorage", err);
  }
}, 3000);

let Experiment = ({
  saveState = saveStateToSessionStorage,
  loadState = loadStateFromSessionStorage,
  ...props
}) => {
  // TODO: maybe we should hide the task registry and instead just pass a list of objects?
  // TODO: not sure how to create different sessions for the same task.

  let [store, setStore] = useState();

  useEffect(() => {
    let storedState;
    let Configuration = { Configuration: props.configuration };

    if (process.env.NODE_ENV !== "development" && loadState) {
      storedState = loadState();
    }

    setStore(
      configureStore(
        { ...Configuration, ...storedState },
        props.taskRegistry.getReducers(),
        saveState
      )
    );
  }, []);

  if (!store) {
    return null;
  }

  return (
    <Provider store={store}>
      <TaskRenderer {...props} />
    </Provider>
  );
};

Experiment.propTypes = {
  configuration: PropTypes.object.isRequired,
  loadState: PropTypes.func,
  saveState: PropTypes.func,
  taskRegistry: PropTypes.instanceOf(TaskRegistry)
};

export default Experiment;
