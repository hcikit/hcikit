import React from 'react'
import { Provider } from 'react-redux'
import PropTypes from 'prop-types'

import App from './core/App'
import configureStore from './core/configureStore'

let store
export default class Experiment extends React.Component {
  static propTypes = {
    configuration: PropTypes.object
  }
  componentWillMount() {
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

// export function registerComponent(component, reducer) {
//   importComponent[component.displayName] = component
//   store.attachReducers({ [component.displayName]: reducer })
// }

// TODO: background tasks would be nice. Could be like middleware, where you have some function called on the task object whenever we increment and then it gets the chance to increment. Could implement non linear workflows that way. Or filtering ones.

// TODO: integration tests.

// TODO: we could render the html using the "server" I think we could do it statically at build. And then we just call hydrate instead. This would improve the bundle size a lot.

// TODO: redux subspace, and redux dynamic reducers will be useful.

// TODO: when losing focus we should grey out the screen, or whenever we can't capture keyboard shortcuts. Implement this as a auxillary task you can add in addition

// TODO: rethink how we do multiple sessions, especially when we start thinking about localstorage.
// TODO: this entire file should just be <ExperimentFramework config={config} /> then the user registers components they might need as well.
// TODO: add helvetica back in as a font....

// TODO: we shouldn't have to rely on s3 for upload. instead we should let users pass in their own upload function

// TODO: register components
