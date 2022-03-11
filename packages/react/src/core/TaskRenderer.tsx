// import { diff } from "jest-diff";

import React, { ElementType } from "react";
import { isEqual } from "lodash-es";

import {
  getCurrentProps,
  getCurrentIndex,
  scopePropsForTask,
  __INDEX__,
} from "@hcikit/workflow";

import { useConfiguration, useExperiment } from "./Experiment.js";

// If there's ever a usecase for logs to get passed then we can add another provider they can subscribe to.

const TaskRenderer: React.FunctionComponent<{
  tasks: Record<string, ElementType>;
  forceRemountEveryTask?: boolean;
}> = ({ tasks, forceRemountEveryTask = true }) => {
  const configuration = useConfiguration();
  const currentProps = getCurrentProps(configuration);

  const { log, advance, modify } = useExperiment();

  const tasksToRender = currentProps.tasks ? [...currentProps.tasks] : [];

  if (currentProps.task) {
    tasksToRender.push(currentProps.task);
  }

  if (!tasksToRender.length) {
    throw new Error(`No task selected at ${getCurrentIndex(configuration)}`);
  }

  return (
    <>
      {tasksToRender.map((task, i) => {
        const Task = tasks[task];

        if (!Task) {
          throw new Error(
            `The task ${task} was not found. Make sure you are passing it in to the <Experiment> component in the tasks prop.`
          );
        }

        let key = `${task}-${i.toString()}`;
        const props = scopePropsForTask(currentProps, task);
        props[__INDEX__] = getCurrentIndex(configuration);

        // By adding the index this forces the component to remount and lose the state it had before.
        if (forceRemountEveryTask) {
          key += "-" + getCurrentIndex(configuration).join(":");
        }

        return (
          <SingleTaskRenderer
            Task={Task}
            key={key}
            log={log}
            advance={advance}
            modify={modify}
            {...props}
          />
        );
      })}
    </>
  );
};

let SingleTaskRenderer: React.FunctionComponent<
  { Task: React.ElementType } & Record<string, unknown>
> = ({ Task, ...props }) => {
  return <Task {...props} />;
};

// Deep equals is needed here or the tests fail, I think I make some objects above like the tasks that get recreated every time.
// could think about memoising those or something.
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
//   forceRemountEveryTask: PropTypes.bool,
// };

export default TaskRenderer;
