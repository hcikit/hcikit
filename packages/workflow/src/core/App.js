import React from "react";
import {
  log,
  editConfig,
  navigateWorkflowTo,
  taskComplete
} from "./Workflow.actions";

import {
  withRawConfiguration,
  getGlobalProps,
  getTask,
  getComponentProps,
  getAllPropsForComponent,
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
  task,
  tasks = [],
  configuration,
  log,
  taskComplete,
  navigateWorkflowTo,
  editConfig,
  getTask,
  Layout = GridLayout,
  ErrorHandler = null,
  forceRemountEveryTask = true
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

  if (task) {
    tasks = [...tasks, task];
  }

  let tasksFilled;

  if (tasks.length > 0) {
    tasksFilled = tasks.map((task, i) => {
      let globalProps = getGlobalProps(configuration);
      let Task = getTask(task, getAllPropsForComponent(task, configuration));
      let key = `${task}-${i.toString()}`;

      if (forceRemountEveryTask) {
        key += "-" + getCurrentIndex(configuration).join(":");
      }

      if (!Task) {
        throw new Error(`Component ${task} isn't registered.`);
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
