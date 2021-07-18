import React from "react";
import PropTypes from "prop-types";
import { isEqual } from "lodash-es";

import {
  getCurrentProps,
  getCurrentIndex,
  scopePropsForTask,
  experimentComplete,
} from "@hcikit/workflow";

import GridLayout from "../GridLayout";
import { useConfig, useExperiment } from "./Experiment";

const TaskRenderer = ({
  // TODO: Ideally we don't pass the entire configuration... That should reduce the number of renders
  tasks,
  Layout = GridLayout,
  ErrorHandler = null,
  forceRemountEveryTask = true,
}) => {
  let configuration = useConfig();
  let currentProps = getCurrentProps(configuration);

  const {
    log,
    taskComplete,
    setWorkflowIndex,
    modifyConfig,
    modifyConfigAtDepth,
  } = useExperiment();

  if (process.env.NODE_ENV === "development") {
    window.currentProps = currentProps;
    window.configuration = configuration;
  }

  let tasksToRender = currentProps.tasks ? [...currentProps.tasks] : [];

  if (currentProps.task) {
    tasksToRender.push(currentProps.task);
  }

  let tasksFilled;

  if (!experimentComplete(configuration)) {
    if (!tasksToRender.length) {
      throw new Error(`No task selected at ${getCurrentIndex(configuration)}`);
    }

    tasksFilled = tasksToRender.map((task, i) => {
      let Task = tasks[task];

      // TODO: ensure that it throws a useful error if the task is not registered

      let key = `${task}-${i.toString()}`;
      let props = scopePropsForTask(currentProps, task);

      if (forceRemountEveryTask) {
        key += "-" + getCurrentIndex(configuration).join(":");
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

// TODO: Why did I choose a deepEqual here...?
const SingleTaskRenderer = React.memo((props) => {
  let { Task } = props;
  return <Task {...props} />;
  // TODO: this deep equals could be somewhat expensive, maybe not the best solution
}, isEqual);
//   (prevProps, nextProps) => {
//     if (isEqual(prevProps, nextProps)) {
//       // console.log();
//       return true;
//     } else {
//       console.log(detailedDiff(prevProps, nextProps));
//       return false;
//     }
//   }
// );

TaskRenderer.propTypes = {
  configuration: PropTypes.object,
  tasks: PropTypes.objectOf(PropTypes.elementType),
  Layout: PropTypes.node,
  ErrorHandler: PropTypes.node,
  forceRemountEveryTask: PropTypes.bool,
  currentProps: PropTypes.object,
};

export default TaskRenderer;
