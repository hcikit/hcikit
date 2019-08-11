import React from 'react'
import { CenteredPaper } from '../components'

export class UploadOnError extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false }
  }

  componentDidCatch(error, info) {
    this.setState({ hasError: true })
    this.props.onLog(
      'javascriptError',
      JSON.stringify(error, Object.getOwnPropertyNames(error))
    )
    this.props.onLog('javscriptErrorInfo', info)
  }

  render() {
    if (this.state.hasError) {
      let {configuration : {experimenter}, onLog, }
      let configuration = this.props.configuration

      return (
        <React.Fragment>
          <CenteredPaper axis='both' width='inherit'>
            <div>
              <h1>Something went wrong.</h1>
              <p>
                You can try refreshing the page. If that doesn't work please
                message the requestor and we will arrange payment. You can also
                email
                <a href={`mailto:${experimenter}`}>
                  {experimenter}
                </a>
              </p>
            </div>
          </CenteredPaper>

          <Uploader
          // TODO: find a better way to do this.
            experimenter={configuration.experimenter}
            filename={configuration.filename}
            onLog={onLog}
            onAdvanceWorkflow={() => {}}
          />
        </React.Fragment>
      )
    }

    return this.props.children
  }
}



export default UploadComponent => props => {
  return <UploadOnError Uploader={UploadComponent} {...props} />;
};
