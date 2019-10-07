import React from "react";
import PropTypes from "prop-types";

import { Button, Typography, CircularProgress } from "@material-ui/core";
import { withRawConfiguration } from "../core/withRawConfiguration";

import { CenteredNicePaper, CenteredText } from "../components";
const UploadDisplay = ({ error, filename, log, experimenter, onClick }) => {
  let contents;

  if (!error) {
    contents = (
      <div>
        <Typography>We&apos;re uploading your results!</Typography>
        <br />
        <CircularProgress size={100} />
      </div>
    );
  } else {
    contents = (
      <div>
        <p>
          Something went wrong uploading your results. We&apos;ll still
          compensate you for your time upon submitting the hit. Please download
          the results and send them to{" "}
          <a href={`mailto:${experimenter}`}>{experimenter}</a>
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

UploadDisplay.propTypes = {
  error: PropTypes.bool,
  experimenter: PropTypes.string,
  filename: PropTypes.string,
  log: PropTypes.string,
  onClick: PropTypes.func
};

// TODO: make this a functional component? Remove or standardise the experimenter property?

export class Upload extends React.Component {
  state = {
    done: false,
    error: null
  };

  UNSAFE_componentWillMount() {
    if (this.props.fireAndForget) {
      this.attemptUploadWithRetries(1);
      this.props.taskComplete();
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
          this.props.taskComplete();
          this.setState({ done: true });
        }
      })
      .catch(upload_error => {
        this.props.log({ upload_error });
        console.error(upload_error);
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
        onClick={this.props.taskComplete}
        experimenter={this.props.experimenter}
        error={this.state.error}
      />
    );
  }
}

Upload.propTypes = {
  configuration: PropTypes.object,
  experimenter: PropTypes.string,
  filename: PropTypes.string,
  fireAndForget: PropTypes.bool,
  taskComplete: PropTypes.func,
  log: PropTypes.func,
  upload: PropTypes.func
};

let ConnectedUpload = withRawConfiguration(Upload);

export default upload => {
  return function UploadWrapper(props) {
    return <ConnectedUpload upload={upload} {...props} />;
  };
};
