import { log, TASK_COMPLETE } from "./actions";
import { createStore } from "redux";

import ConfigurationReducer from "./reducers";
import { experimentComplete, getLeafIndex, __INDEX__ } from "./workflow";

export default (configuration, saveState) => {
  let store;

  if (!configuration[__INDEX__]) {
    // TODO: maybe use setIndex
    configuration[__INDEX__] = getLeafIndex([], configuration);
  }

  // TODO: this maybe is simplifiable
  if (process.env.NODE_ENV !== "production") {
    store = createStore(
      ConfigurationReducer,
      configuration,
      window.__REDUX_DEVTOOLS_EXTENSION__ &&
        window.__REDUX_DEVTOOLS_EXTENSION__()
    );
  } else {
    store = createStore(ConfigurationReducer, configuration);
  }

  if (saveState) {
    store.subscribe(() => saveState(store.getState()));
  }

  let dispatch = store.dispatch;

  store.dispatch = action => {
    if (action.type === TASK_COMPLETE) {
      dispatch(log({ eventType: "end" }));
    }

    dispatch(action);

    if (
      action.type === TASK_COMPLETE &&
      !experimentComplete(store.getState())
    ) {
      dispatch(log({ eventType: "start" }));
    }
  };

  dispatch(log({ eventType: "start" }));

  return store;
};
