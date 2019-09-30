import React, { Component } from "react";
import Experiment, { TaskRegistry } from "@hcikit/workflow";
import {
  ConsentForm,
  InformationScreen,
  DisplayText,
  ProgressBar,
  WizardProgress,
  DevTools,
  DOMEventLogger
} from "@hcikit/tasks";
import IncrementTask, { reducer } from "./IncrementTask";
import CustomTask from "./CustomTask";

import configuration from "./configuration";
// import ConfigUnroller from "./ConfigUnroller";

let taskRegistry = new TaskRegistry({
  CustomTask,
  ConsentForm,
  InformationScreen,
  DisplayText,
  ProgressBar,
  WizardProgress,
  DevTools,
  DOMEventLogger
});

taskRegistry.registerTask("IncrementTask", IncrementTask, reducer);

export default class App extends Component {
  render() {
    return (
      <Experiment taskRegistry={taskRegistry} configuration={configuration} />
    );
  }
}
