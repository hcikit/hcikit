import React from "react";
import {
  advanceWorkflow,
  advanceWorkflowLevelTo,
  log,
  editConfig
} from "./Workflow.actions";
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

// TODO: How can we move this out of the workflow package but let HCIKit work out of the box..
const GridLayout = ({ children }) => {
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
  Layout = GridLayout,
  ErrorHandler = null
}) => {
  if (task) {
    tasks = [...tasks, task];
  }

  // TODO: make it pick properly between sending the finished component. If there is a tasks array set at the top level then it never has no tasks. This also means it's possible to continue passed the end of the experiment.

  let tasksFilled;

  if (tasks.length > 0) {
    tasksFilled = tasks.map(task => {
      let globalProps = getGlobalProps(configuration);
      let Task = getTask(task, getAllPropsForComponent(task, configuration));

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
    });
  } else {
    tasksFilled = (
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
    );
  }

  if (ErrorHandler) {
    return (
      <ErrorHandler onLog={onLog} configuration={configuration}>
        <Layout>{tasksFilled}</Layout>
      </ErrorHandler>
    );
  }

  return <Layout>{tasksFilled}</Layout>;
};

const mapStateToProps = state => {
  // TODO: getTask doesn't handle all props..
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
  // TODO: Rename to taskComplete or something...
  onAdvanceWorkflowLevelTo: advanceWorkflowLevelTo
};

export default withRawConfiguration(
  connect(
    mapStateToProps,
    mapDispatchToProps
  )(App)
);
