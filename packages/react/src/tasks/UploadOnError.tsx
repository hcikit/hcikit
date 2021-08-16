/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import React from "react";
import { CenteredNicePaper } from "../components";
import PropTypes from "prop-types";
import {
  ControlFunctions,
  useConfiguration,
  useExperiment,
} from "../core/Experiment";
import { Configuration } from "@hcikit/workflow";

interface UploadOnErrorProps {
  experiment: ControlFunctions;
  configuration: Configuration;
  Uploader: React.ComponentType<Record<string, unknown>>;
}

// TODO: rewrite all of this to use the upload component because I changed how error handlers work.

export class UploadOnError extends React.Component<
  UploadOnErrorProps,
  unknown
> {
  static propTypes: {
    children: unknown;
    configuration: unknown;
    log: unknown;
    Uploader: unknown;
  };

  state: { hasError: boolean } = { hasError: false };

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    this.setState({ hasError: true });
    this.props.experiment.log({
      javascriptError: JSON.stringify(error, Object.getOwnPropertyNames(error)),
      errorInfo,
      type: "JAVASCRIPT_ERROR",
    });
  }

  render() {
    if (this.state.hasError) {
      const Uploader = this.props.Uploader;

      return (
        <React.Fragment>
          <CenteredNicePaper centerX centerY>
            <div>
              <h1>Something went wrong.</h1>
              <p>
                You can try refreshing the page. If that doesn&apos;t work
                please message the requestor and we will arrange payment. You
                can also email
                {/* TODO: this experimenter is wrong. It should come from wherever the propsm say is an experimenter but it only comes from the top level. */}
                <a href={`mailto:${this.props.configuration.experimenter}`}>
                  {this.props.configuration.experimenter as string}
                </a>
              </p>
            </div>
          </CenteredNicePaper>

          <Uploader
            // TODO: find a better way to do this.
            experimenter={this.props.configuration.experimenter}
            filename={this.props.configuration.filename}
          />
        </React.Fragment>
      );
    }

    return this.props.children;
  }
}

UploadOnError.propTypes = {
  children: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.node),
    PropTypes.node,
  ]).isRequired,
  configuration: PropTypes.object,
  log: PropTypes.func,
  Uploader: PropTypes.node,
};

const uploadOnErrorCreator = (UploadComponent: React.ComponentType) => {
  const UploadOnErrorWrapper: React.FunctionComponent = function (props) {
    const configuration = useConfiguration();
    const experiment = useExperiment();
    return (
      <UploadOnError
        Uploader={UploadComponent}
        experiment={experiment}
        configuration={configuration}
        {...props}
      />
    );
  };
  return UploadOnErrorWrapper;
};

export default uploadOnErrorCreator;
