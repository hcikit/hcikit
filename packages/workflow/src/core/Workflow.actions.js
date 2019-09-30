export const taskComplete = () => {
  return {
    type: TASK_COMPLETE
  };
};

export const setWorkflowIndex = value => {
  return {
    type: SET_WORKFLOW_INDEX,
    value
  };
};

export const log = log => {
  return {
    type: LOG,
    log
  };
};

export const logAction = action => {
  return {
    type: LOG_ACTION,
    action
  };
};

export const editConfig = (key, value) => {
  return {
    type: EDIT_CONFIG,
    key,
    value
  };
};

export const TASK_COMPLETE = "TASK_COMPLETE";
export const SET_WORKFLOW_INDEX = "SET_WORKFLOW_INDEX";
export const LOG = "LOG";
export const LOG_ACTION = "LOG_ACTION";
export const EDIT_CONFIG = "EDIT_CONFIG";
