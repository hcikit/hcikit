import React, { Component } from "react";
import Experiment, {
  ConsentForm,
  InformationScreen,
  DisplayText,
  ProgressBar,
  WizardProgress,
  DevTools,
  DOMEventLogger
} from "@hcikit/tasks";
import IncrementTask from "./IncrementTask";
import CustomTask from "./CustomTask";

import configuration from "./configuration";
// import ConfigUnroller from "./ConfigUnroller";

let tasks = {
  CustomTask,
  ConsentForm,
  InformationScreen,
  DisplayText,
  ProgressBar,
  WizardProgress,
  DevTools,
  DOMEventLogger,
  IncrementTask
};

export default class App extends Component {
  render() {
    return <Experiment tasks={tasks} configuration={configuration} />;
  }
}
