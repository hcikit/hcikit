import React, { useLayoutEffect, useState } from "react";
import PropTypes from "prop-types";

import { Button, Typography, CircularProgress } from "@material-ui/core";

import { CenteredNicePaper, CenteredText } from "../components";
import { useConfiguration, useExperiment } from "../core/Experiment";
import { Configuration } from "@hcikit/workflow";

async function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// TODO: Remove or standardise the experimenter property?

type UploadFunction = (filename: string, config: Configuration) => Promise<any>;

interface UploadProps {
  filename: string;
  fireAndForget?: boolean;
  upload: UploadFunction;
  experimenter: string;
  retries?: number;
  delay?: number;
}

export const Upload: React.FunctionComponent<UploadProps> = ({
  fireAndForget,
  upload,
  filename,
  experimenter,
  retries = 3,
  delay = 1000,
}) => {
  const [done, setDone] = useState(false);
  const [error, setError] = useState(false);
  const experiment = useExperiment();
  const configuration = useConfiguration();

  useLayoutEffect(() => {
    function attemptUploadWithRetries(retriesLeft: number) {
      const logs = { ...configuration };
      upload(filename, logs)
        .then(() => {
          experiment.log({ type: "UPLOAD_COMPLETE" });
          if (!fireAndForget) {
            experiment.advance();
            setDone(true);
          }
        })
        .catch(async (upload_error) => {
          experiment.log({ upload_error, type: "UPLOAD_ERROR" });
          console.error(upload_error);
          if (retriesLeft > 0) {
            await sleep(delay);

            attemptUploadWithRetries(retriesLeft - 1);
          } else if (!fireAndForget) {
            console.error("Done retrying: ", upload_error);
            setError(true);
          }
        });
    }

    attemptUploadWithRetries(retries);

    if (fireAndForget) {
      experiment.advance();
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
          onClick={() => experiment.advance()}
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
