import { throttle } from "lodash-es";
import React, { useEffect, useState } from "react";
import { Provider } from "react-redux";
import PropTypes from "prop-types";

import { configureStore } from "@hcikit/workflow";
import TaskRenderer from "./TaskRenderer";

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

let Experiment = ({
  saveState = saveStateToSessionStorage,
  loadState = loadStateFromSessionStorage,
  ...props
}) => {
  // TODO: maybe we should hide the task registry and instead just pass a list of objects?
  // TODO: not sure how to create different sessions for the same task.

  let [store, setStore] = useState();
  console.log(setStore);
  console.log({ store });
  /* eslint-disable react-hooks/exhaustive-deps */
  useEffect(() => {
    let storedState;

    if (process.env.NODE_ENV !== "development" && loadState) {
      storedState = loadState();
    }

    setStore(
      configureStore({ ...props.configuration, ...storedState }, saveState)
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
  tasks: PropTypes.objectOf(PropTypes.elementType),
};

export default Experiment;
