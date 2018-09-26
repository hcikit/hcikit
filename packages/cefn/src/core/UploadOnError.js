import React from "react";
import { CenteredPaper } from "../layout";
import Loadable from "react-loadable";

//TODO: should upload using dependency injection depending which upload method they choose....
const UploadToS3 = Loadable({
  loader: () => import("../tasks/UploadToS3"),
  loading: () => <div>Loading...</div>
});

export class UploadOnError extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  componentDidCatch(error, info) {
    this.setState({ hasError: true });
    this.props.onLog(
      "javascriptError",
      JSON.stringify(error, Object.getOwnPropertyNames(error))
    );
    this.props.onLog("javscriptErrorInfo", info);
  }

  render() {
    if (this.state.hasError) {
      let configuration = this.props.configuration;

      return (
        <React.Fragment>
          <CenteredPaper axis="both" width="inherit">
            <div>
              <h1>Something went wrong.</h1>
              <p>
                You can try refreshing the page. If that doesn't work please
                message the requestor and we will arrange payment. You can also
                email
                <a href={`mailto:${this.props.configuration.experimenter}`}>
                  {this.props.configuration.experimenter}
                </a>
              </p>
            </div>
          </CenteredPaper>

          <UploadToS3
            experimenter={configuration.experimenter}
            onLog={this.props.onLog}
            onAdvanceWorkflow={() => {}}
            s3FileName={`${configuration.participant}-ERROR.json`}
            AWS_REGION={configuration.AWS_REGION}
            AWS_S3_BUCKET={configuration.AWS_S3_BUCKET}
            AWS_COGNITO_IDENTITY_POOL_ID={
              configuration.AWS_COGNITO_IDENTITY_POOL_ID
            }
          />
        </React.Fragment>
      );
    }

    return this.props.children;
  }
}
