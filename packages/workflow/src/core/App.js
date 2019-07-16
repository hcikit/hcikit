import React from "react";
import { advanceWorkflow, advanceWorkflowLevelTo, log, editConfig } from "./Workflow.actions";
import {
  withRawConfiguration,
  getGlobalProps,
  getTask,
  getComponentProps,
  getAllPropsForComponent
} from "./Workflow";
import { connect } from "react-redux";

// const DefaultGridLayout = styled.div`
//   display: grid;
//   width: 100vw;
//   height: 100vh;
//   grid-template-columns: 1fr;
//   grid-template-rows: min-content 1fr min-content;
//   grid-template-areas:
//     "header"
//     "task"
//     "footer";
// `;

const DefaultGridLayout = ({ children }) => {
  return (
    <div
      style={{
        display: "grid",
        width: "100vw",
        height: "100vh",
        gridTemplateColumns: "1fr",
        gridTemplateRows: "min-content 1fr min-content",
        gridTemplateAreas: `
      "header"
      "task"
      "footer"`
      }}
    >
      {children}
    </div>
  );
};

export const App = ({
  task,
  tasks = [],
  configuration,
  onLog,
  onAdvanceWorkflow,
  onAdvanceWorkflowLevelTo,
  onEditConfig,
  getTask,
  GridLayout = DefaultGridLayout
}) => {
  if (task) {
    tasks = [...tasks, task];
  }

  if (tasks.length > 0) {
    return (
      // TODO: pass in upload function to create upload on error.
      // <UploadOnError onLog={onLog} configuration={configuration}>
      <GridLayout>
        {tasks.map(task => {
          let globalProps = getGlobalProps(configuration);
          let Task = getTask(
            task,
            getAllPropsForComponent(task, configuration)
          );

          if (!Task) {
            // TODO: Better error messaging here.
            console.log(`Component ${task} isn't registered.`);
            return <div>Sorry an error occurred!!</div>;
          }

          return (
            <Task
              onAdvanceWorkflow={onAdvanceWorkflow}
              onAdvanceWorkflowLevelTo={onAdvanceWorkflowLevelTo}
              onLog={onLog}
              onEditConfig={onEditConfig}
              getTask={getTask}
              {...globalProps}
              {...getComponentProps(task, configuration)}
            />
          );
        })}
      </GridLayout>
      // </UploadOnError>
    );
  } else {
    return (
      <GridLayout>
        <div style={{ gridArea: "task" }}>
          <h1>You've completed the experiment!</h1>
          <a
            download={`${configuration.participant || "log"}.json`}
            href={`data:text/json;charset=utf-8,${encodeURIComponent(
              JSON.stringify(configuration)
            )}`}
          >
            Download experiment log
          </a>
        </div>
      </GridLayout>
    );
  }
};

const mapStateToProps = state => {
  // TODOL get Task doesn't handle all props..
  let props = getGlobalProps(state.Configuration);
  return {
    ...props,
    getTask: taskName => getTask(taskName, props)
  };
};

const mapDispatchToProps = {
  onAdvanceWorkflow: advanceWorkflow,
  onLog: log,
  onEditConfig: editConfig,
  onAdvanceWorkflowLevelTo: advanceWorkflowLevelTo
};

export default withRawConfiguration(
  connect(
    mapStateToProps,
    mapDispatchToProps
  )(App)
);
