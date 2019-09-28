import React from "react";
import {
  log,
  editConfig,
  taskComplete,
  setWorkflowIndex
} from "./Workflow.actions";

import {
  withRawConfiguration,
  getCurrentProps,
  scopePropsForTask,
  experimentComplete,
  __INDEX__
} from "./Workflow";

import TaskRegistry from "./TaskRegistry";

import PropTypes from "prop-types";

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

export const GridLayout = ({ children }) => {
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

GridLayout.propTypes = {
  children: PropTypes.arrayOf(PropTypes.node)
};

export const App = ({
  // TODO: Ideally we don't pass the entire configuration... That should reduce the number of renders
  configuration,
  log,
  taskComplete,
  setWorkflowIndex,
  editConfig,
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

  let tasks = currentProps.tasks || [];

  if (currentProps.task) {
    tasks = [...tasks, currentProps.task];
  }

  let tasksFilled;

  if (!experimentComplete(configuration)) {
    if (!tasks.length) {
      throw new Error(`No task selected at ${configuration[__INDEX__]}`);
    }

    tasksFilled = tasks.map((task, i) => {
      let Task = taskRegistry.getTask(task);
      let key = `${task}-${i.toString()}`;
      let props = scopePropsForTask(currentProps, task);

      if (forceRemountEveryTask) {
        key += "-" + configuration[__INDEX__].join(":");
      }

      return (
        <Task
          key={key}
          // TODO: finish deprecating these by documenting the changes.
          onAdvanceWorkflow={onAdvanceWorkflow}
          onLog={onLog}
          onEditConfig={onEditConfig}
          setWorkflowIndex={setWorkflowIndex}
          log={log}
          taskComplete={taskComplete}
          editConfig={editConfig}
          {...props}
        />
      );
    });
  } else {
    tasksFilled = (
      <div style={{ gridArea: "task" }}>
        <h1>You&apos;ve completed the experiment!</h1>
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

App.propTypes = {
  configuration: PropTypes.object,
  log: PropTypes.func,
  taskComplete: PropTypes.func,
  setWorkflowIndex: PropTypes.func,
  editConfig: PropTypes.func,
  taskRegistry: PropTypes.instanceOf(TaskRegistry),
  Layout: PropTypes.node,
  ErrorHandler: PropTypes.node,
  forceRemountEveryTask: PropTypes.bool,
  currentProps: PropTypes.object
};

const mapStateToProps = state => {
  return { currentProps: getCurrentProps(state.Configuration) };
};

const mapDispatchToProps = {
  taskComplete,
  log,
  editConfig,
  setWorkflowIndex
};

export default withRawConfiguration(
  connect(
    mapStateToProps,
    mapDispatchToProps
  )(App)
);
