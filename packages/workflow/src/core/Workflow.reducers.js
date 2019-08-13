import {
  taskComplete,
  advanceWorkflowLevelTo,
  log,
  logAction,
  __INDEX__
} from "./Workflow";
import {
  LOG,
  LOG_ACTION,
  TASK_COMPLETE,
  EDIT_CONFIG,
  NAVIGATE_WORKFLOW_TO
} from "./Workflow.actions";

const configuration = (state = { events: [] }, action) => {
  switch (action.type) {
    case TASK_COMPLETE:
      state = { ...state, [__INDEX__]: taskComplete(state) };
      return state;
    case NAVIGATE_WORKFLOW_TO:
      state = { ...state };
      advanceWorkflowLevelTo(state, action.level, action.newValue);
      return state;
    case LOG:
      state = { ...state };
      log(state, action.key, action.value);
      return state;
    case LOG_ACTION:
      state = { ...state };
      logAction(state, action.action, action.withTimeStamp);
      return state;
    case EDIT_CONFIG:
      // TODO: I want edit config to be more than just global
      return { ...state, [action.key]: action.value };
    default:
      return state;
  }
};

export default configuration;
