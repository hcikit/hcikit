import React from 'react'
import { Provider } from 'react-redux'
import PropTypes from 'prop-types'

import App from './core/App'
import configureStore from './core/configureStore'
import * as tasks from './tasks'
import { registerTask } from './core/Workflow'

let store
/**
 * This component takes a configuration that allows you to run an experiment.
 */
export default class Experiment extends React.Component {
  static propTypes = {
    configuration: PropTypes.object
  }
  componentWillMount() {
    // TODO: if we use uploading as middleware we could pass as a prop
    store = configureStore(this.props.configuration)
  }

  render() {
    return (
      <Provider store={store}>
        <App />
      </Provider>
    )
  }
}

export { registerTask }
export * from './tasks'
export * from './Utils'
export * from './designUtils'

export * from './layout'

// TODO:  this might force them all to be imported.. Not sure how tree shaking works... This should probably be in a file all by itself.
export function registerAll() {
  Object.keys(tasks).forEach(key => registerTask(key, tasks[key]))
}

// TODO: background tasks would be nice. Could be like middleware, where you have some function called on the task object whenever we increment and then it gets the chance to increment. Could implement non linear workflows that way. Or filtering ones.

// TODO: integration tests.

// TODO: we could render the html using the "server" I think we could do it statically at build. And then we just call hydrate instead. This would improve the bundle size a lot.

// TODO: redux subspace, and redux dynamic reducers will be useful.

// TODO: when losing focus we should grey out the screen, or whenever we can't capture keyboard shortcuts. Implement this as a auxillary task you can add in addition

// TODO: rethink how we do multiple sessions, especially when we start thinking about localstorage.
// TODO: add helvetica back in as a font....
