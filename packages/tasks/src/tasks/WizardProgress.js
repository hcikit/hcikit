import React from "react";
import { Stepper, Step, StepLabel } from "@material-ui/core";
import { withRawConfiguration, __INDEX__ } from "@hcikit/workflow";
import { withGridItem } from "../withGridItem";

// TODO: should we use a custom prop like the label or should we consider just using the task and then people can include spaces if they'd like?

// TODO: we could also use a depth parameter here
let WizardProgress = ({ setWorkflowIndex, configuration }) => {
  let currentStep = 0;

  if (configuration[__INDEX__] && configuration[__INDEX__].length) {
    currentStep = configuration[__INDEX__][0];
  }

  return (
    <Stepper activeStep={currentStep}>
      {configuration.children.map(({ task }, index) => {
        return (
          <Step
            style={{
              cursor:
                process.env.NODE_ENV === "development" ? "pointer" : "default"
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

WizardProgress = withGridItem(WizardProgress, "header");
export { WizardProgress };

export default withRawConfiguration(WizardProgress);
