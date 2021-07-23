// import { diff } from "jest-diff";

import React, { ElementType } from "react";
import { isEqual } from "lodash";

import {
  getCurrentProps,
  getCurrentIndex,
  scopePropsForTask,
  experimentComplete,
} from "@hcikit/workflow";

import GridLayout from "../GridLayout";
import { useConfig, useExperiment } from "./Experiment";

// TODO: does logs get passed to the components? I feel like it shouldn't... but it's hard in case they actually need it.

const TaskRenderer: React.FunctionComponent<{
  tasks: Record<string, ElementType>;
  Layout?: ElementType;
  ErrorHandler?: ElementType;
  forceRemountEveryTask?: boolean;
}> = ({
  tasks,
  Layout = GridLayout,
  ErrorHandler = null,
  forceRemountEveryTask = true,
}) => {
  const configuration = useConfig();
  const currentProps = getCurrentProps(configuration);

  const {
    log,
    taskComplete,
    setWorkflowIndex,
    modifyConfig,
    modifyConfigAtDepth,
  } = useExperiment();

  const tasksToRender = currentProps.tasks ? [...currentProps.tasks] : [];

  if (currentProps.task) {
    tasksToRender.push(currentProps.task);
  }

  let tasksFilled;

  if (!experimentComplete(configuration)) {
    if (!tasksToRender.length) {
      throw new Error(`No task selected at ${getCurrentIndex(configuration)}`);
    }

    tasksFilled = tasksToRender.map((task, i) => {
      const Task = tasks[task];

      if (!Task) {
        throw new Error(
          `The task ${task} was not found. Make sure you are passing it in to the <Experiment> component in the tasks prop.`
        );
      }

      let key = `${task}-${i.toString()}`;
      const props = scopePropsForTask(currentProps, task);

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

let SingleTaskRenderer: React.FunctionComponent<
  { Task: React.ElementType } & Record<string, unknown>
> = ({ Task, ...props }) => {
  return <Task {...props} />;
};

// Deep equals is needed here or the tests fail, I think I make some objects above like the tasks that get recreated every time.
// TODO: could think about memoising those or something.
SingleTaskRenderer = React.memo(SingleTaskRenderer, isEqual);
//   (prevProps, nextProps) => {
//     console.log("outside", diff(prevProps, nextProps), nextProps);

//     if (isEqual(prevProps, nextProps)) {
//       // console.log();
//       return true;
//     } else {
//       console.log("inside", diff(prevProps, nextProps));
//       return false;
//     }
//   }
// );

// SingleTaskRenderer.propTypes = {
//   Task: PropTypes.elementType.isRequired,
// };
// TaskRenderer.propTypes = {
//   tasks: PropTypes.objectOf(PropTypes.elementType),
//   Layout: PropTypes.node,
//   ErrorHandler: PropTypes.node,
//   forceRemountEveryTask: PropTypes.bool,
// };

export default TaskRenderer;
