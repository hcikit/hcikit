import React from 'react'

import Typography from '@material-ui/core/Typography'
import CircularProgress from '@material-ui/core/CircularProgress'
import Button from '@material-ui/core/Button'

import { CenteredNicePaper, CenteredText } from '../components'
import { withRawConfiguration } from '../core/Workflow'

export const UploadDisplay = ({
  error,
  participant,
  log,
  experimenter,
  onClick
}) => {
  let contents

  if (!error) {
    contents = (
      <div>
        <Typography>We're uploading your results!</Typography>
        <br />
        <CircularProgress size={100} />
      </div>
    )
  } else {
    contents = (
      <div>
        <p>
          Something went wrong uploading your results. We'll still compensate
          you for your time upon submitting the hit. Please download the results
          and send them to <a href={`mailto:${experimenter}`}>{experimenter}</a>
        </p>
        <a
          download={`${participant}.json`}
          href={`data:text/json;charset=utf-8,${log}`}
        >
          Download experiment log
        </a>
        <br />
        <Button variant='contained' color='primary' onClick={onClick}>
          Continue
        </Button>
      </div>
    )
  }

  return (
    <CenteredNicePaper centerX centerY>
      <CenteredText>{contents}</CenteredText>
    </CenteredNicePaper>
  )
}

class Upload extends React.Component {
  state = {
    done: false,
    error: null
  }

  UNSAFE_componentWillMount() {
    if (this.props.fireAndForget) {
      this.attemptUploadWithRetries(1)
      this.props.onAdvanceWorkflow()
    } else {
      this.attemptUploadWithRetries(3)
    }
  }

  attemptUploadWithRetries(retries) {
    let logs = { ...this.props.configuration }
    logs.events = window.logs

    this.props
      .upload(this.props.filename, logs)
      .then(() => {
        if (!this.props.fireAndForget) {
          this.props.onAdvanceWorkflow()
          this.setState({ done: true })
        }
      })
      .catch(err => {
        this.props.onLog('upload error', err)
        console.log(err)
        if (retries > 0) {
          this.attemptUploadWithRetries(retries - 1)
        } else {
          this.setState({ error: true })
        }
      })
  }

  render() {
    if (this.state.done) {
      return null
    }
    return (
      <UploadDisplay
        log={JSON.stringify(this.props.configuration)}
        participant={this.props.configuration.participant}
        onClick={this.props.onAdvanceWorkflow}
        experimenter={this.props.experimenter}
        error={this.state.error}
      />
    )
  }
}

let ConnectedUpload = withRawConfiguration(Upload)

export default upload => props => {
  return <ConnectedUpload upload={upload} {...props} />
}
