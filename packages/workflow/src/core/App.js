import React from "react";
import {
  log,
  editConfig,
  navigateWorkflowTo,
  taskComplete
} from "./Workflow.actions";

import {
  withRawConfiguration,
  getCurrentProps,
  scopePropsForTask,
  getCurrentIndex
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
  // TODO: Ideally we don't pass the entire configuration... That should reduce the number of renders
  configuration,
  log,
  taskComplete,
  navigateWorkflowTo,
  editConfig,
  getTask,
  taskRegistry,
  Layout = GridLayout,
  ErrorHandler = null,
  forceRemountEveryTask = true,
  currentProps
}) => {
  let onLog = (...args) => {
    console.warn(
      "WARNING! onLog has been deprecated, use log instead. The behaviour of this function has also changed."
    );

    log(...args);
  };

  let onEditConfig = (...args) => {
    console.warn(
      "WARNING! onEditConfig has been deprecated, use editConfig() instead. The behaviour of this function has also changed."
    );

    editConfig(...args);
  };

  let onAdvanceWorkflow = (...args) => {
    console.warn(
      "WARNING! onAdvanceWorkflow has been deprecated, use taskComplete() instead."
    );

    taskComplete(...args);
  };

  let onAdvanceWorkflowLevelTo = (...args) => {
    console.warn(
      "WARNING! onAdvanceWorkflow has been deprecated, use navigateWorkflowTo() instead."
    );

    navigateWorkflowTo(...args);
  };

  let tasks = currentProps.tasks || [];

  if (currentProps.task) {
    tasks = [...tasks, currentProps.task];
  }

  let tasksFilled;

  if (getCurrentIndex(configuration).length > 0) {
    if (!tasks.length) {
      throw new Error(`No task selected at ${getCurrentIndex(configuration)}`);
    }

    tasksFilled = tasks.map((task, i) => {
      let Task = taskRegistry.getTask(task);
      let key = `${task}-${i.toString()}`;
      let props = scopePropsForTask(currentProps, task);

      if (forceRemountEveryTask) {
        key += "-" + getCurrentIndex(configuration).join(":");
      }

      return (
        <Task
          key={key}
          // TODO: finish deprecating these by documenting the changes.
          onAdvanceWorkflow={onAdvanceWorkflow}
          onAdvanceWorkflowLevelTo={onAdvanceWorkflowLevelTo}
          onLog={onLog}
          onEditConfig={onEditConfig}
          log={log}
          taskComplete={taskComplete}
          editConfig={editConfig}
          getTask={getTask}
          {...props}
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
  return { currentProps: getCurrentProps(state.Configuration) };
};

const mapDispatchToProps = {
  taskComplete,
  log,
  editConfig,
  navigateWorkflowTo
};

export default withRawConfiguration(
  connect(
    mapStateToProps,
    mapDispatchToProps
  )(App)
);
