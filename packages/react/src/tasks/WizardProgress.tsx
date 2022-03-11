import React from "react";
import { Stepper, Step, StepLabel } from "@mui/material";
import { withGridItem } from "../GridLayout.js";
import {
  getCurrentIndex,
  getConfigurationAtIndex,
  getLeafIndex,
} from "@hcikit/workflow";
import { useConfiguration, useExperiment } from "../core/Experiment.js";
import { startCase } from "lodash-es";

// TODO: is labela  good name?
const NoGridWizardProgress: React.FunctionComponent<{ depth: number }> = ({
  depth = 0,
}) => {
  const experiment = useExperiment();
  const configuration = useConfiguration();
  const pathToIndex = getCurrentIndex(configuration).slice(0, depth);

  let configurationAtIndex = getConfigurationAtIndex(
    configuration,
    pathToIndex
  );

  const currentStep = getLeafIndex(
    configuration,
    getCurrentIndex(configuration)
  )[depth];

  if (!configurationAtIndex || !configurationAtIndex.children) {
    console.error(
      "Attempted to render WizardProgress at a depth that does not have any children"
    );
    return null;
  }

  let nonSkippedChildren = configurationAtIndex.children.filter(
    ({ skip }) => !skip
  );

  // [0,1,2,skip,3,4,skip,5]
  // [0,1,2,3,4,5,6,7]

  let skippedTillNow = configurationAtIndex.children
    .slice(0, currentStep + 1)
    .filter(({ skip }) => skip).length;

  return (
    <Stepper activeStep={currentStep - skippedTillNow}>
      {nonSkippedChildren.map(({ task, label }, index) => (
        <Step
          style={{
            cursor:
              process.env.NODE_ENV === "development" ? "pointer" : "default",
          }}
          onClick={() => {
            if (process.env.NODE_ENV === "development") {
              experiment.advance([...pathToIndex, index]);
            }
          }}
          key={index}
        >
          <StepLabel>{(label as string) || startCase(task)}</StepLabel>
        </Step>
      ))}
    </Stepper>
  );
};

const WizardProgress = withGridItem(NoGridWizardProgress, "header");
export { WizardProgress };

export default WizardProgress;
