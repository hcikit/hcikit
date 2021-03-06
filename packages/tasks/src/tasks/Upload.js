import React from "react";
import PropTypes from "prop-types";

import { Button, Typography, CircularProgress } from "@material-ui/core";
import { withRawConfiguration } from "@hcikit/workflow";

import { CenteredNicePaper, CenteredText } from "../components";

const UploadDisplay = ({ error, filename, log, experimenter, onClick }) => {
  let contents;

  if (!error) {
    contents = (
      <div>
        <Typography>We're uploading your results!</Typography>
        <br />
        <CircularProgress size={100} />
      </div>
    );
  } else {
    contents = (
      <div>
        <p>
          Something went wrong uploading your results. We'll still compensate
          you for your time upon submitting the hit. Please download the results
          and send them to <a href={`mailto:${experimenter}`}>{experimenter}</a>
        </p>
        <a
          download={`${filename}.json`}
          href={`data:text/json;charset=utf-8,${log}`}
        >
          Download experiment log
        </a>
        <br />
        <Button variant="contained" color="primary" onClick={onClick}>
          Continue
        </Button>
      </div>
    );
  }

  return (
    <CenteredNicePaper centerX centerY>
      <CenteredText>{contents}</CenteredText>
    </CenteredNicePaper>
  );
};

export class Upload extends React.Component {
  state = {
    done: false,
    error: null
  };

  UNSAFE_componentWillMount() {
    if (this.props.fireAndForget) {
      this.attemptUploadWithRetries(1);
      this.props.onAdvanceWorkflow();
    } else {
      this.attemptUploadWithRetries(3);
    }
  }

  attemptUploadWithRetries(retries) {
    let logs = { ...this.props.configuration };
    logs.events = window.logs;

    this.props
      .upload(this.props.filename, logs)
      .then(() => {
        if (!this.props.fireAndForget) {
          this.props.onAdvanceWorkflow();
          this.setState({ done: true });
        }
      })
      .catch(err => {
        this.props.onLog("upload error", err);
        console.log(err);
        if (retries > 0) {
          this.attemptUploadWithRetries(retries - 1);
        } else {
          this.setState({ error: true });
        }
      });
  }

  render() {
    if (this.state.done) {
      return null;
    }
    return (
      <UploadDisplay
        log={JSON.stringify(this.props.configuration)}
        filename={this.props.filename}
        onClick={this.props.onAdvanceWorkflow}
        experimenter={this.props.experimenter}
        error={this.state.error}
      />
    );
  }
}

Upload.propTypes = {
  fireAndForget: PropTypes.bool,
  filename: PropTypes.string,
  /** The email of the experimenter to send logfiles manually in case of a problem uploading */
  experimenter: PropTypes.string,
  /** The upload function should take a filename and a string containing all of the logs to upload */
  upload: PropTypes.func
};

let ConnectedUpload = withRawConfiguration(Upload);

export default upload => props => {
  return <ConnectedUpload upload={upload} {...props} />;
};
