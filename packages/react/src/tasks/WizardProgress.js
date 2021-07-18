import React from "react";
import { Stepper, Step, StepLabel } from "@material-ui/core";

import { withGridItem } from "../GridLayout";
import PropTypes from "prop-types";
import { getCurrentIndex } from "@hcikit/workflow";
import { useConfig } from "../core/Experiment";

// TODO: should we use a custom prop like the label or should we consider just using the task and then people can include spaces if they'd like?
// What does include spaces even mean....

// TODO: we could also use a depth parameter here
let WizardProgress = ({ setWorkflowIndex }) => {
  let configuration = useConfig();
  let currentStep = getCurrentIndex(configuration)[0];

  return (
    <Stepper activeStep={currentStep}>
      {configuration.children.map(({ task }, index) => {
        return (
          <Step
            style={{
              cursor:
                process.env.NODE_ENV === "development" ? "pointer" : "default",
            }}
            onClick={() => {
              if (process.env.NODE_ENV === "development") {
                setWorkflowIndex([index]);
              }
            }}
            key={task}
          >
            <StepLabel>{task}</StepLabel>
          </Step>
        );
      })}
    </Stepper>
  );
};

WizardProgress.propTypes = {
  setWorkflowIndex: PropTypes.func,
  configuration: PropTypes.object,
};

WizardProgress = withGridItem(WizardProgress, "header");
export { WizardProgress };

export default WizardProgress;
