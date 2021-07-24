import React, { useLayoutEffect, useState } from "react";
import PropTypes from "prop-types";

import { Button, Typography, CircularProgress } from "@material-ui/core";

import { CenteredNicePaper, CenteredText } from "../components";
import { useConfig, useExperiment } from "../core/Experiment";
import { Configuration } from "@hcikit/workflow";

// TODO: Remove or standardise the experimenter property?

type UploadFunction = (
  filename: string,
  config: Configuration
) => Promise<void>;

interface UploadProps {
  filename: string;
  fireAndForget?: boolean;
  upload: UploadFunction;
  experimenter: string;
}

const Upload: React.FunctionComponent<UploadProps> = ({
  fireAndForget,
  upload,
  filename,
  experimenter,
}) => {
  const [done, setDone] = useState(false);
  const [error, setError] = useState(false);
  const experiment = useExperiment();
  const configuration = useConfig();

  useLayoutEffect(() => {
    function attemptUploadWithRetries(retries: number) {
      const logs = { ...configuration };

      upload(filename, logs)
        .then(() => {
          if (!fireAndForget) {
            experiment.taskComplete();
            setDone(true);
          }
        })
        .catch((upload_error) => {
          experiment.log({ upload_error, type: "UPLOAD_ERROR" });
          console.error(upload_error);
          if (retries > 0) {
            attemptUploadWithRetries(retries - 1);
          } else {
            setError(true);
          }
        });
    }

    if (fireAndForget) {
      attemptUploadWithRetries(1);
      experiment.taskComplete();
    } else {
      attemptUploadWithRetries(3);
    }
    // This is empty on purpose, we don't want to reupload the results if the things don't change.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (done) {
    return null;
  }

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
          href={`data:text/json;charset=utf-8,${JSON.stringify(configuration)}`}
        >
          Download experiment log
        </a>
        <br />
        <Button
          variant="contained"
          color="primary"
          onClick={experiment.taskComplete}
        >
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

Upload.propTypes = {
  experimenter: PropTypes.string.isRequired,
  filename: PropTypes.string.isRequired,
  fireAndForget: PropTypes.bool,
  upload: PropTypes.func.isRequired,
};

const uploadCreator = (
  upload: UploadFunction
): React.FunctionComponent<UploadProps> => {
  return function UploadWrapper(props) {
    return <Upload {...props} upload={upload} />;
  };
};

export default uploadCreator;
