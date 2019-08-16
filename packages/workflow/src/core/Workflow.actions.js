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

export const navigateWorkflowTo = (level, newValue) => {
  return {
    type: NAVIGATE_WORKFLOW_TO,
    level,
    newValue
  };
};

export const log = (key, value) => {
  return {
    type: LOG,
    key,
    value
  };
};

export const logAction = (action, withTimeStamp = true) => {
  return {
    type: LOG_ACTION,
    action,
    withTimeStamp
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
export const NAVIGATE_WORKFLOW_TO = "NAVIGATE_WORKFLOW_TO";
export const LOG = "LOG";
export const LOG_ACTION = "LOG_ACTION";
export const EDIT_CONFIG = "EDIT_CONFIG";
