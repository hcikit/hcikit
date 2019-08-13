import {
  logAction,
  log,
  LOG,
  LOG_ACTION,
  TASK_COMPLETE
} from "./Workflow.actions";
import { createStore, combineReducers } from "redux";
import { throttle } from "lodash-es";
import ConfigurationReducer from "./Workflow.reducers";
import { getCurrentIndex } from "./Workflow";

const STATE_KEY = "state";

const loadState = () => {
  try {
    const state = window.localStorage.getItem(STATE_KEY);
    if (state) {
      return JSON.parse(state);
    }
  } catch (err) {}

  return undefined;
};

const saveState = throttle(state => {
  try {
    window.localStorage.setItem(STATE_KEY, JSON.stringify(state));
  } catch (err) {}
}, 1000);

export default (Configuration, reducers) => {
  let storedState;

  if (process.env.NODE_ENV === "production") {
    storedState = loadState();
  }

  if (
    storedState &&
    storedState.Configuration.session !== Configuration.session
  ) {
    storedState = undefined;
  }

  let store = {};
  reducers["Configuration"] = ConfigurationReducer;
  let reducer = combineReducers(reducers);

  if (process.env.NODE_ENV !== "production") {
    store = createStore(
      reducer,
      {
        Configuration,
        ...storedState
      },
      window.__REDUX_DEVTOOLS_EXTENSION__ &&
        window.__REDUX_DEVTOOLS_EXTENSION__()
    );
  } else {
    store = createStore(reducer, {
      Configuration,
      ...storedState
    });
  }

  store.subscribe(() => saveState(store.getState()));

  let dispatch = store.dispatch;

  store.dispatch = action => {
    if ([LOG, LOG_ACTION].indexOf(action.type) === -1) {
      dispatch(logAction(action));
    }

    if (action.type === TASK_COMPLETE) {
      dispatch(log("end", Date.now(), false));
    }

    dispatch(action);

    if (
      action.type === TASK_COMPLETE &&
      getCurrentIndex(store.getState().Configuration).length !== 0
    ) {
      dispatch(log("start", Date.now(), false));
    }
  };

  dispatch(log("start", Date.now(), false));

  return store;
};
