import Experiment, { registerTask } from "./";
import React from "react";
import { mount } from "enzyme";

const config = {
  tasks: ["AuxTask"],
  children: [
    {
      text: "hello",
      task: "ButtonTask"
    },

    {
      text: "hi",
      task: "ButtonTask"
    }
  ]
};

let ButtonTask = ({ taskComplete, text, log }) => (
  <button
    onClick={() => {
      log("hello", "world");
      taskComplete();
    }}
  >
    {text}
  </button>
);

let AuxTask = ({}) => <p>Hello World!</p>;

describe("Experiment", () => {
  let experiment;
  beforeEach(() => {
    registerTask("ButtonTask", ButtonTask);
    registerTask("AuxTask", AuxTask);

    experiment = mount(<Experiment configuration={config} />);
  });

  it("renders the proper task", () => {
    expect(experiment.find("button").text()).toEqual(config.children[0].text);
  });

  it("advances to the next task", () => {
    experiment.find("button").simulate("click");
    expect(experiment.find("button").text()).toEqual(config.children[1].text);
  });

  it("continues to the end even with array", () => {
    experiment.find("button").simulate("click");
    experiment.find("button").simulate("click");

    expect(experiment.find("h1").exists()).toBe(true);
    expect(experiment.find("h1").text()).toEqual(
      "You've completed the experiment!"
    );
  });
  // it("remounts when required", () => {
  //   fail()

  // })

  // it("passes all props", () => {
  //   fail()

  // })

  // it("doesn't pass logs to components", () => {
  //   fail()
  // })
});
