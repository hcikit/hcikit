import React from "react";
import { Provider } from "react-redux";
import PropTypes from "prop-types";

import TaskRenderer, { GridLayout } from "./core/App";
import configureStore from "./core/configureStore";
import TaskRegistry from "./core/TaskRegistry";

/**
 * This component takes a configuration that allows you to run an experiment.
 */
export default class Experiment extends React.Component {
  // TODO: maybe we should hide the task registry and instead just pass a list of objects?
  // TODO: Need a way to pass in a state / saver / loader, how does this work in combination with s3?

  store = configureStore(
    this.props.configuration,
    this.props.taskRegistry.getReducers()
  );

  render() {
    return (
      <Provider store={this.store}>
        <TaskRenderer {...this.props} />
      </Provider>
    );
  }
}

Experiment.propTypes = {
  configuration: PropTypes.object.isRequired,
  taskRegistry: PropTypes.instanceOf(TaskRegistry)
};

export * from "./core/Workflow";

export { GridLayout };

export { default as TaskRegistry } from "./core/TaskRegistry";
export * from "./Utils";

// TODO: background tasks would be nice. Could be like middleware, where you have some function called on the task object whenever we increment and then it gets the chance to increment. Could implement non linear workflows that way. Or filtering ones.

// TODO: integration tests, ones that you can train to run a single task and string them together.

// TODO: we could render the html using the "server" I think we could do it statically at build. And then we just call hydrate instead. This would improve the render time a bit. https://github.com/stereobooster/react-snap https://www.npmjs.com/package/react-snapshot https://create-react-app.dev/docs/pre-rendering-into-static-html-files

// TODO: when losing focus we should grey out the screen, or whenever we can't capture keyboard shortcuts. Implement this as a auxillary task you can add in addition

// TODO: need a task that automatically logs when changing tabs

// TODO: rethink how we do multiple sessions, especially when we start thinking about localstorage.

// TODO: add helvetica back in as a font....
