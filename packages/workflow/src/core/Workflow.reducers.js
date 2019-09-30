import { taskComplete, log, logAction, __INDEX__ } from "./Workflow";
import {
  LOG,
  LOG_ACTION,
  TASK_COMPLETE,
  EDIT_CONFIG,
  SET_WORKFLOW_INDEX
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
    case EDIT_CONFIG:
      // TODO: I want edit config to be more than just global
      return { ...state, [action.key]: action.value };
    default:
      return state;
  }
};

export default configuration;
