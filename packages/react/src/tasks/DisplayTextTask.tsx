import React from "react";
import { Button } from "@material-ui/core";
import { CenteredDiv, CenteredText } from "../components";
import PropTypes from "prop-types";
import { withGridItem } from "../GridLayout";
import { useExperiment } from "../core/Experiment";
/**
 * Creates a simple ane small piece of text in the middle of the screen with a continue button.
 */
const DisplayTextTask: React.FunctionComponent<{ content: string }> = ({
  content,
}) => {
  let experiment = useExperiment();
  return (
    <CenteredDiv centerX centerY>
      <CenteredText>
        <h1>{content}</h1>
        <Button
          variant="contained"
          color="primary"
          onClick={experiment.taskComplete}
        >
          Continue
        </Button>
      </CenteredText>
    </CenteredDiv>
  );
};

DisplayTextTask.propTypes = {
  content: PropTypes.string.isRequired,
};

export default withGridItem(DisplayTextTask);
