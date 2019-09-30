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
import { experimentComplete, getLeafIndex, __INDEX__ } from "./Workflow";

const STATE_KEY = "state";

const loadState = () => {
  try {
    const state = window.localStorage.getItem(STATE_KEY);
    if (state) {
      return JSON.parse(state);
    }
  } catch (err) {
    console.error("Failed to load from localStorage");
  }

  return undefined;
};

const saveState = throttle(state => {
  try {
    window.localStorage.setItem(STATE_KEY, JSON.stringify(state));
  } catch (err) {
    // TODO: Better logging?
    console.error("Failed to save to localStorage");
  }
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

  Configuration[__INDEX__] = getLeafIndex([], Configuration);

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
