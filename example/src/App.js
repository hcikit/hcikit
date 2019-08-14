import React, { Component } from "react";
import Experiment, { TaskRegistry } from "@hcikit/workflow";
import {
  ConsentForm,
  InformationScreen,
  DisplayText,
  ExperimentProgress
} from "@hcikit/tasks";
import IncrementTask, { reducer } from "./IncrementTask";
import CustomTask from "./CustomTask";

import configuration from "./configuration";

let taskRegistry = new TaskRegistry({
  CustomTask,
  ConsentForm,
  InformationScreen,
  DisplayText,
  ExperimentProgress
});

taskRegistry.registerTask("IncrementTask", IncrementTask, reducer);

export default class App extends Component {
  render() {
    return (
      <Experiment taskRegistry={taskRegistry} configuration={configuration} />
    );
  }
}
