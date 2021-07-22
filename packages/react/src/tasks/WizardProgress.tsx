import React from "react";
import { Stepper, Step, StepLabel } from "@material-ui/core";

import { withGridItem } from "../GridLayout";
import { getCurrentIndex } from "@hcikit/workflow";
import { useConfig, useExperiment } from "../core/Experiment";

// TODO: should we use a custom prop like the label or should we consider just using the task and then people can include spaces if they'd like?
// What does include spaces even mean....

// TODO: we could also use a depth parameter here
const NoGridWizardProgress: React.FunctionComponent = () => {
  const experiment = useExperiment();
  const configuration = useConfig();
  const currentStep = getCurrentIndex(configuration)[0];

  if (!configuration.children) {
    return null;
  }

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
                experiment.setWorkflowIndex([index]);
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

const WizardProgress = withGridItem(NoGridWizardProgress, "header");
export { WizardProgress };

export default WizardProgress;
