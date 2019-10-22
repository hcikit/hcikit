import { iterateConfigWithProps } from "@hcikit/workflow";
import React from "react";
import { Provider } from "react-redux";
import { createStore } from "redux";

// TODO: this doesn't have a store so everything breaks
export default ({ configuration, taskMappings }) => {
  return iterateConfigWithProps(configuration).map(({ task, ...props }) => {
    let Task = taskMappings[task];
    // TODO: make the store actually work and then make it just replay when it fires task complete.
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
