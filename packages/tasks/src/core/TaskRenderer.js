import React from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";

import {
  getCurrentProps,
  scopePropsForTask,
  experimentComplete,
  __INDEX__,
  TaskRegistry,
  log,
  modifyConfigAtDepth,
  modifyConfig,
  taskComplete,
  setWorkflowIndex
} from "@hcikit/workflow";

import { withRawConfiguration } from "./withRawConfiguration";
import GridLayout from "../GridLayout";

const TaskRenderer = ({
  // TODO: Ideally we don't pass the entire configuration... That should reduce the number of renders
  configuration,
  log,
  taskComplete,
  setWorkflowIndex,
  modifyConfig,
  modifyConfigAtDepth,
  taskRegistry,
  Layout = GridLayout,
  ErrorHandler = null,
  forceRemountEveryTask = true,
  currentProps
}) => {
  if (process.env.NODE_ENV === "development") {
    window.currentProps = currentProps;
    window.configuration = configuration;
  }

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
          setWorkflowIndex={setWorkflowIndex}
          log={log}
          taskComplete={taskComplete}
          modifyConfig={modifyConfig}
          modifyConfigAtDepth={modifyConfigAtDepth}
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
      <ErrorHandler log={log} configuration={configuration}>
        <Layout>{tasksFilled}</Layout>
      </ErrorHandler>
    );
  }

  return <Layout>{tasksFilled}</Layout>;
};

TaskRenderer.propTypes = {
  configuration: PropTypes.object,
  log: PropTypes.func,
  taskComplete: PropTypes.func,
  setWorkflowIndex: PropTypes.func,
  modifyConfig: PropTypes.func,
  modifyConfigAtDepth: PropTypes.func,
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
  modifyConfig,
  modifyConfigAtDepth,
  setWorkflowIndex
};

export default withRawConfiguration(
  connect(
    mapStateToProps,
    mapDispatchToProps
  )(TaskRenderer)
);
