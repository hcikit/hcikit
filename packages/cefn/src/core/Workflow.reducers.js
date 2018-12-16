import {
  advanceWorkflow,
  advanceWorkflowLevelTo,
  log,
  logAction
} from './Workflow'
import {
  LOG,
  LOG_ACTION,
  ADVANCE_WORKFLOW,
  EDIT_CONFIG,
  ADVANCE_WORKFLOW_LEVEL_TO
} from './Workflow.actions'

const configuration = (state = { events: [] }, action) => {
  switch (action.type) {
    case ADVANCE_WORKFLOW:
      state = { ...state }
      advanceWorkflow(state)
      return state
    case ADVANCE_WORKFLOW_LEVEL_TO:
      state = { ...state }
      advanceWorkflowLevelTo(state, action.level, action.newValue)
      return state
    case LOG:
      state = { ...state }
      log(state, action.key, action.value)
      return state
    case LOG_ACTION:
      state = { ...state }
      logAction(state, action.action, action.withTimeStamp)
      return state
    case EDIT_CONFIG:
      return { ...state, [action.key]: action.value }
    default:
      return state
  }
}

export default configuration
