import React, { useRef, useEffect } from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import { isEqual } from "lodash";

import {
  getCurrentProps,
  scopePropsForTask,
  experimentComplete,
  __INDEX__,
  log,
  modifyConfigAtDepth,
  modifyConfig,
  taskComplete,
  setWorkflowIndex
} from "@hcikit/workflow";

import GridLayout from "../GridLayout";

const TaskRenderer = ({
  // TODO: Ideally we don't pass the entire configuration... That should reduce the number of renders
  configuration,
  log,
  taskComplete,
  setWorkflowIndex,
  modifyConfig,
  modifyConfigAtDepth,
  tasks,
  Layout = GridLayout,
  ErrorHandler = null,
  forceRemountEveryTask = true,
  currentProps
}) => {
  if (process.env.NODE_ENV === "development") {
    window.currentProps = currentProps;
    window.configuration = configuration;
  }

  let tasksToRender = currentProps.tasks || [];

  if (currentProps.task) {
    tasksToRender.push(currentProps.task);
  }

  let tasksFilled;

  if (!experimentComplete(configuration)) {
    if (!tasksToRender.length) {
      throw new Error(`No task selected at ${configuration[__INDEX__]}`);
    }

    tasksFilled = tasksToRender.map((task, i) => {
      let Task = tasks[task];

      // TODO: ensure that it throws a useful error if the task is not registered

      let key = `${task}-${i.toString()}`;
      let props = scopePropsForTask(currentProps, task);

      if (forceRemountEveryTask) {
        key += "-" + configuration[__INDEX__].join(":");
      }

      return (
        <SingleTaskRenderer
          Task={Task}
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

const SingleTaskRenderer = React.memo(props => {
  let { Task } = props;
  return <Task {...props} />;
  // TODO: this deep equals could be somewhat expensive, maybe not the best solution
}, isEqual);

TaskRenderer.propTypes = {
  configuration: PropTypes.object,
  log: PropTypes.func,
  taskComplete: PropTypes.func,
  setWorkflowIndex: PropTypes.func,
  modifyConfig: PropTypes.func,
  modifyConfigAtDepth: PropTypes.func,
  tasks: PropTypes.objectOf(PropTypes.elementType),
  Layout: PropTypes.node,
  ErrorHandler: PropTypes.node,
  forceRemountEveryTask: PropTypes.bool,
  currentProps: PropTypes.object
};

const mapStateToProps = configuration => {
  return { currentProps: getCurrentProps(configuration), configuration };
};

const mapDispatchToProps = {
  taskComplete,
  log,
  modifyConfig,
  modifyConfigAtDepth,
  setWorkflowIndex
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(TaskRenderer);
