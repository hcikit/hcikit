import React, { Component } from "react";
import Experiment, {
  DOMEventLogger,
  Fitts,
  ConsentForm,
  InformationScreen
} from "@hcikit/tasks";

// import configuration from "./configuration";
import configuration from "./fitts-configuration";

// import ConfigUnroller from "./ConfigUnroller";
import Replayer from "./Replayer";
import log from "./log";
import ReplayGrid from "./ReplayGrid";

let tasks = {
  DOMEventLogger, //: () => null,
  Fitts,
  ConsentForm,
  InformationScreen
};

let firstTime = log.children[0].children[0].logs[0].timestamp;

console.log(firstTime);

let startTime = Date.now();

let transformTime = t => {
  return t - (startTime - firstTime);
};

export default class App extends Component {
  render() {
    return (
      <Experiment tasks={tasks} configuration={configuration} />
      // <ReplayGrid
      //   tasks={tasks}
      //   logs={[log, log, log, log]}
      //   index={[0, 0]}
      //   transformTime={transformTime}
      // ></ReplayGrid>
    );
  }
}
