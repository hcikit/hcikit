import { logAction, log, LOG, LOG_ACTION, TASK_COMPLETE } from "./actions";
import { createStore, combineReducers } from "redux";

import ConfigurationReducer from "./reducers";
import { experimentComplete, getLeafIndex, __INDEX__ } from "./Workflow";

export default (configuration, reducers, saveState) => {
  let store = {};
  reducers["Configuration"] = ConfigurationReducer;
  let reducer = combineReducers(reducers);

  if (!configuration.Configuration[__INDEX__]) {
    // TODO: maybe use setIndex
    configuration.Configuration[__INDEX__] = getLeafIndex(
      [],
      configuration.Configuration
    );
  }

  if (process.env.NODE_ENV !== "production") {
    store = createStore(
      reducer,
      configuration,
      window.__REDUX_DEVTOOLS_EXTENSION__ &&
        window.__REDUX_DEVTOOLS_EXTENSION__()
    );
  } else {
    store = createStore(reducer, configuration);
  }

  if (saveState) {
    store.subscribe(() => saveState(store.getState()));
  }

  let dispatch = store.dispatch;

  store.dispatch = action => {
    if ([LOG, LOG_ACTION].indexOf(action.type) === -1) {
      dispatch(logAction(action));
    }

    if (action.type === TASK_COMPLETE) {
      dispatch(log({ type: "end" }));
    }

    dispatch(action);

    if (
      action.type === TASK_COMPLETE &&
      !experimentComplete(store.getState().Configuration)
    ) {
      dispatch(log({ type: "start" }));
    }
  };

  dispatch(log({ type: "start" }));

  return store;
};
