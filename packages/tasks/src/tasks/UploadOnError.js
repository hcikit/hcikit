import React from "react";
import { CenteredNicePaper } from "../components";
import PropTypes from "prop-types";

export class UploadOnError extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  componentDidCatch(error, javscriptErrorInfo) {
    this.setState({ hasError: true });
    this.props.log({
      javascriptError: JSON.stringify(error, Object.getOwnPropertyNames(error)),
      javscriptErrorInfo
    });
  }

  render() {
    if (this.state.hasError) {
      let {
        configuration: { experimenter },
        log
      } = this.props.configuration;
      let configuration = this.props.configuration;

      let Uploader = this.props.Uploader;

      return (
        <React.Fragment>
          <CenteredNicePaper axis="both" width="inherit">
            <div>
              <h1>Something went wrong.</h1>
              <p>
                You can try refreshing the page. If that doesn&apos;t work
                please message the requestor and we will arrange payment. You
                can also email
                <a href={`mailto:${experimenter}`}>{experimenter}</a>
              </p>
            </div>
          </CenteredNicePaper>

          <Uploader
            // TODO: find a better way to do this.
            experimenter={configuration.experimenter}
            filename={configuration.filename}
            log={log}
            taskComplete={() => {}}
          />
        </React.Fragment>
      );
    }

    return this.props.children;
  }
}

UploadOnError.propTypes = {
  children: PropTypes.arrayOf(PropTypes.node),
  configuration: PropTypes.object,
  log: PropTypes.func,
  Uploader: PropTypes.node
};

export default UploadComponent => {
  return function UploadOnErrorWrapper(props) {
    return <UploadOnError Uploader={UploadComponent} {...props} />;
  };
};
