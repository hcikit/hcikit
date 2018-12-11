import React, { Component } from "react";
import Experiment from "cefn";


const configuration = {
  InformationScreen: {
    content: "<h1>Hello world</h1>"
  },
  // tasks: ["Buttons"],
  participant: "yo",
  children: [
    {
      task: "InformationScreen"
    }
  ]
};

export default class App extends Component {
  render() {
    return (
      // <Button>
      // HELLO
      <Experiment configuration={configuration} />
      // </Button>
    );
  }
}
