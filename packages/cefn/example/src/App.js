import React, { Component } from "react";
import Experiment from "excurse";

const configuration = {
  InformationScreen: {
    content: "<h1>Hello world</h1>"
  },
  task: "InformationScreen"
};

export default class App extends Component {
  render() {
    return (
      <div>
        <Experiment configuration={configuration} />
      </div>
    );
  }
}
