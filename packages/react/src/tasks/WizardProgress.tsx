import React from "react";
import { Stepper, Step, StepLabel } from "@material-ui/core";
import { withGridItem } from "../GridLayout";
import {
  getCurrentIndex,
  getConfigurationAtIndex,
  getLeafIndex,
} from "@hcikit/workflow";
import { useConfiguration, useExperiment } from "../core/Experiment";
import { startCase } from "lodash";

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

  return (
    <Stepper activeStep={currentStep}>
      {configurationAtIndex.children.map(({ task, label }, index) => {
        return (
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
        );
      })}
    </Stepper>
  );
};

const WizardProgress = withGridItem(NoGridWizardProgress, "header");
export { WizardProgress };

export default WizardProgress;
