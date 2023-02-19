import { Configuration } from "@hcikit/workflow";
import { ControlFunctions } from "./Experiment";

export interface HCIKitPlugin {
  onConfigChange(config: Configuration): void;
  onInit(experiment: ControlFunctions, config: Configuration): void;
}
