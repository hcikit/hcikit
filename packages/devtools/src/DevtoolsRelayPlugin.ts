import { ControlFunctions, HCIKitPlugin } from "@hcikit/react";
import { Configuration } from "@hcikit/workflow";
import { advanceStream, sendAdvance, sendConfig } from "./messages";

export default class DevtoolsRelayPlugin implements HCIKitPlugin {
  config: Configuration | undefined = undefined;

  experiment: ControlFunctions | undefined = undefined;

  constructor() {
    advanceStream.subscribe((sample) => {
      if (this.experiment) {
        this.experiment.advance(sample[0].index);
      }
    });
  }

  onConfigChange(config: Configuration): void {
    this.config = config;
    sendConfig(config);
  }
  onInit(experiment: ControlFunctions, config: Configuration): void {
    this.experiment = experiment;
    this.config = config;
    sendConfig(config);
  }

  getConfig() {
    return this.config;
  }

  getExperiment() {
    return this.experiment;
  }
}
