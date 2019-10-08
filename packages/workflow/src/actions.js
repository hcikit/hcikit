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

export const modifyConfigAtDepth = (newConfig, depth) => {
  return {
    type: MODIFY_CONFIG_AT_DEPTH,
    newConfig,
    depth
  };
};

export const modifyConfig = (newConfig, index) => {
  return {
    type: MODIFY_CONFIG,
    newConfig,
    index
  };
};

export const TASK_COMPLETE = "TASK_COMPLETE";
export const SET_WORKFLOW_INDEX = "SET_WORKFLOW_INDEX";
export const LOG = "LOG";
export const MODIFY_CONFIG = "MODIFY_CONFIG";
export const MODIFY_CONFIG_AT_DEPTH = "MODIFY_CONFIG_AT_DEPTH";
