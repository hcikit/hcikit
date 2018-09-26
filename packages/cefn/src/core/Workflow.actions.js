export const advanceWorkflow = () => {
  return {
    type: ADVANCE_WORKFLOW
  };
};

export const advanceWorkflowLevelTo = (level, newValue) => {
  return {
    type: ADVANCE_WORKFLOW_LEVEL_TO,
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

export const ADVANCE_WORKFLOW = "ADVANCE_WORKFLOW";
export const ADVANCE_WORKFLOW_LEVEL_TO = "ADVANCE_WORKFLOW_LEVEL_TO";
export const LOG = "LOG";
export const LOG_ACTION = "LOG_ACTION";
export const EDIT_CONFIG = "EDIT_CONFIG";
