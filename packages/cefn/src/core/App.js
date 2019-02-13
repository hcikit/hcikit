import React from 'react'
import { advanceWorkflow, log, editConfig } from './Workflow.actions'
import {
  withRawConfiguration,
  getGlobalProps,
  getTask,
  getComponentProps,
  getAllPropsForComponent
} from './Workflow'
import { connect } from 'react-redux'

// import { UploadOnError } from './UploadOnError'

export const App = ({
  task,
  tasks = [],
  configuration,
  onLog,
  onAdvanceWorkflow,
  onEditConfig,
  getTask
}) => {
  if (task) {
    tasks = [...tasks, task]
  }

  if (tasks.length > 0) {
    return (
      // TODO: pass in upload function to create upload on error.
      // <UploadOnError onLog={onLog} configuration={configuration}>
      <React.Fragment>
        {tasks.map(task => {
          let globalProps = getGlobalProps(configuration)
          let Task = getTask(task, getAllPropsForComponent(task, configuration))

          if (!Task) {
            console.log(`Component ${task} isn't registered.`)
            return <div>Sorry an error occurred!!</div>
          }

          return (
            <Task
              onAdvanceWorkflow={onAdvanceWorkflow}
              onLog={onLog}
              onEditConfig={onEditConfig}
              getTask={getTask}
              {...getComponentProps(task, configuration)}
              {...globalProps}
            />
          )
        })}
      </React.Fragment>
      // </UploadOnError>
    )
  } else {
    return (
      <div>
        <h1>You've completed the experiment!</h1>;
        <a
          download={`${configuration.participant || 'log'}.json`}
          href={`data:text/json;charset=utf-8,${JSON.stringify(configuration)}`}
        >
          Download experiment log
        </a>
      </div>
    )
  }
}

const mapStateToProps = state => {
  // TODOL get Task doesn't handle all props..
  let props = getGlobalProps(state.Configuration)
  return {
    ...props,
    getTask: taskName => getTask(taskName, props)
  }
}

const mapDispatchToProps = {
  onAdvanceWorkflow: advanceWorkflow,
  onLog: log,
  onEditConfig: editConfig
}

export default withRawConfiguration(
  connect(
    mapStateToProps,
    mapDispatchToProps
  )(App)
)
