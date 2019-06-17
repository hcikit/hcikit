import React, { Component } from "react";
import Experiment, { registerTask } from "@hcikit/workflow";
import { registerAll } from "@hcikit/tasks";
import IncrementTask, { reducer } from "./IncrementTask";
import CustomTask from "./CustomTask";

import configuration from "./configuration";

registerAll(registerTask);
registerTask("IncrementTask", IncrementTask, reducer);
registerTask("CustomTask", CustomTask);

export default class App extends Component {
  render() {
    return <Experiment configuration={configuration} />;
  }
}
