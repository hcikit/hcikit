import React, { Component } from "react";
import { DOMEventLogger, Fitts } from "@hcikit/tasks";

// import configuration from "./configuration";
import configuration from "./fitts-configuration";

// import ConfigUnroller from "./ConfigUnroller";
import Replayer from "./Replayer";
import log from "./log";

let tasks = {
  DOMEventLogger,
  Fitts
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
      <Replayer
        tasks={tasks}
        log={log}
        index={[0, 0]}
        transformTime={transformTime}
        onReplayComplete={() => {}}
      />
    );
  }
}
