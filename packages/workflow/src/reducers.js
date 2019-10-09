import {
  markTaskComplete,
  logToConfig,
  __INDEX__,
  modifyConfiguration,
  modifyConfigurationAtDepth
} from "./workflow";

import {
  LOG,
  TASK_COMPLETE,
  MODIFY_CONFIG_AT_DEPTH,
  MODIFY_CONFIG,
  SET_WORKFLOW_INDEX
} from "./actions";

const configuration = (state = { events: [] }, action) => {
  switch (action.type) {
    case TASK_COMPLETE:
      state = { ...state, [__INDEX__]: markTaskComplete(state) };
      return state;
    case SET_WORKFLOW_INDEX:
      return {
        ...state,
        [__INDEX__]: action.value
      };
    case LOG:
      state = { ...state };
      logToConfig(state, action.log);
      return state;
    case MODIFY_CONFIG_AT_DEPTH:
      state = { ...state };
      modifyConfigurationAtDepth(state, action.newConfig, action.depth);
      return state;
    case MODIFY_CONFIG:
      state = { ...state };
      modifyConfiguration(state, action.newConfig, action.index);
      return state;
    default:
      return state;
  }
};

export default configuration;
