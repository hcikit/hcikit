import React, { useEffect } from "react";
import Markdown from "markdown-to-jsx";

import { Button } from "@material-ui/core";
import { CenteredNicePaper } from "../components";
import PropTypes from "prop-types";
import { useExperiment } from "../core/Experiment";

/**
 * Creates a screen with information or instructions and a continue button.
 * Accepts Markdown.
 * By setting withContinue to false it can also be used as an end screen of an experiment.
 * Uses a keyboard shortcut when specified.
 */
const InformationScreen: React.FunctionComponent<{
  content: string;
  withContinue?: boolean;
  centerX?: boolean;
  centerY?: boolean;
  shortcutEnabled?: boolean;
  shortcut?: string;
}> = ({
  content,
  withContinue = true,
  centerX,
  centerY,
  shortcutEnabled,
  shortcut = "Enter",
}) => {
  const experiment = useExperiment();

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === shortcut && shortcutEnabled && withContinue) {
        experiment.taskComplete();
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [experiment, shortcut, shortcutEnabled, withContinue]);

  return (
    <CenteredNicePaper centerX={centerX} centerY={centerY}>
      <Markdown>{content}</Markdown>
      <br />
      {withContinue && (
        <Button color="primary" onClick={experiment.taskComplete}>
          Continue {shortcutEnabled && `(${shortcut})`}
        </Button>
      )}
    </CenteredNicePaper>
  );
};

InformationScreen.propTypes = {
  centerX: PropTypes.bool,
  centerY: PropTypes.bool,
  content: PropTypes.string.isRequired,
  withContinue: PropTypes.bool,
  shortcutEnabled: PropTypes.bool,
  /* The KeyboardEvent.key value to use as a shortcut */
  shortcut: PropTypes.string,
};

export default InformationScreen;
