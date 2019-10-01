import {
  taskComplete,
  log,
  logAction,
  __INDEX__,
  modifyConfig
} from "./Workflow";
import {
  LOG,
  LOG_ACTION,
  TASK_COMPLETE,
  MODIFY_CONFIG_AT_DEPTH,
  MODIFY_CONFIG,
  SET_WORKFLOW_INDEX,
  modifyConfigAtDepth
} from "./Workflow.actions";

const configuration = (state = { events: [] }, action) => {
  switch (action.type) {
    case TASK_COMPLETE:
      state = { ...state, [__INDEX__]: taskComplete(state) };
      return state;
    case SET_WORKFLOW_INDEX:
      return {
        ...state,
        [__INDEX__]: action.value
      };
    case LOG:
      state = { ...state };
      log(state, action.log);
      return state;
    case LOG_ACTION:
      state = { ...state };
      logAction(state, action.action);
      return state;
    case MODIFY_CONFIG_AT_DEPTH:
      state = { ...state };
      modifyConfigAtDepth(state, action.newConfig, action.depth);
      return state;
    case MODIFY_CONFIG:
      state = { ...state };
      modifyConfig(state, action.newConfig, action.index);
      return state;
    default:
      return state;
  }
};

export default configuration;
