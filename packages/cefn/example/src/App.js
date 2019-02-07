import React, { Component } from "react";
import Experiment, { registerAll, registerTask } from "@blainelewis1/cefn";

registerAll();
registerTask(
  "CustomTask",
  ({ text, onLog, onEditConfig, onAdvanceWorkflow }) => {
    return (
      <div
        onClick={() => {
          onLog("hello", "world");
          onEditConfig("content", "<h1>Hello world</h1>");
          onAdvanceWorkflow();
        }}
      >
        {text}
      </div>
    );
  }
);

const configuration = {
  CustomTask: {
    text: "This is a custom task. Click the paragraph to continue"
  },
  // tasks: ["Buttons"],
  participant: "yo",
  children: [
    {
      task: "CustomTask"
    },
    {
      task: "InformationScreen"
    }
  ]
};

export default class App extends Component {
  render() {
    return <Experiment configuration={configuration} />;
  }
}
