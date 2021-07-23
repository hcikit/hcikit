import React, { Component } from "react";
import Experiment, {
  ConsentForm,
  InformationScreen,
  DisplayText,
  ProgressBar,
  WizardProgress,
  DevTools,
} from "@hcikit/react";
import IncrementTask from "./IncrementTask";
import CustomTask from "./CustomTask";

import configuration from "./configuration";

let tasks = {
  CustomTask,
  ConsentForm,
  InformationScreen,
  DisplayText,
  ProgressBar,
  WizardProgress,
  DevTools,
  IncrementTask,
};

export default class App extends Component {
  render() {
    return <Experiment tasks={tasks} configuration={configuration} />;
  }
}
