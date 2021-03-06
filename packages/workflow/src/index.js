import React from "react";
import { Provider } from "react-redux";
import PropTypes from "prop-types";

import App from "./core/App";
import configureStore from "./core/configureStore";
let store;
/**
 * This component takes a configuration that allows you to run an experiment.
 */
export default class Experiment extends React.Component {
  componentWillMount() {
    // TODO: if we use uploading as middleware we could pass as a prop
    store = configureStore(this.props.configuration);
  }

  render() {
    return (
      <Provider store={store}>
        <App />
      </Provider>
    );
  }
}

Experiment.propTypes = {
  configuration: PropTypes.object
};

export { registerTask, withRawConfiguration } from "./core/Workflow";

export * from "./Utils";
export * from "./designUtils";

// TODO: background tasks would be nice. Could be like middleware, where you have some function called on the task object whenever we increment and then it gets the chance to increment. Could implement non linear workflows that way. Or filtering ones.

// TODO: integration tests, ones that you can train to run a single task and string them together.

// TODO: we could render the html using the "server" I think we could do it statically at build. And then we just call hydrate instead. This would improve the bundle size a lot.

// TODO: redux subspace, and redux dynamic reducers will be useful.

// TODO: when losing focus we should grey out the screen, or whenever we can't capture keyboard shortcuts. Implement this as a auxillary task you can add in addition

// TODO: rethink how we do multiple sessions, especially when we start thinking about localstorage.
// TODO: add helvetica back in as a font....

// TODO: need a task that automatically logs when changing tabs
