import { iterateConfigWithProps } from "@hcikit/workflow";
import React from "react";
import { Provider } from "react-redux";
import { createStore } from "redux";

// TODO: this doesn't have a store so everything breaks
export default ({ configuration, taskRegistry }) => {
  return iterateConfigWithProps(configuration).map(({ task, ...props }) => {
    let Task = taskRegistry.getTask(task);
    let store = createStore(({ x = {} }) => x, {});
    return (
      <Provider store={store}>
        <Task
          store={store}
          editConfig={() => {}}
          setWorkflowIndex={() => {}}
          log={() => {}}
          taskComplete={() => {}}
          {...props}
        />
      </Provider>
    );
  });
};
