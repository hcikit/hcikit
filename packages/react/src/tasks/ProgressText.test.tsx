import React from "react";
import ProgressText from "./ProgressText";
import { render, screen } from "@testing-library/react";
import Experiment, { useExperiment } from "../core/Experiment";
import { Configuration } from "@hcikit/workflow";

let BlankTask: React.FunctionComponent = () => null;

let basicConfig: Configuration = {
  __INDEX__: [0],
  tasks: ["ProgressText", "ClickToAdvance"],
  children: [
    { label: "hello world", task: "BlankTask" },
    { task: "BlankTask" },
    { label: "labels", task: "BlankTask" },
  ],
};

let advancedConfig: Configuration = {
  tasks: ["ProgressText", "ClickToAdvance"],
  depth: 1,

  children: [
    {
      label: "hello world",
      children: [
        { label: "0,0", task: "BlankTask" },
        { label: "0,1", task: "BlankTask" },
        { label: "0,2", task: "BlankTask" },
      ],
    },
    {
      label: "hello world",
      children: [
        { label: "1,0", task: "BlankTask" },
        { label: "1,1", task: "BlankTask" },
      ],
    },
    { label: "hello world", task: "BlankTask" },
  ],
};

let ClickToAdvance: React.FunctionComponent = () => {
  const experiment = useExperiment();
  return <button onClick={() => experiment.advance()}>advance</button>;
};

describe("ProgressText", () => {
  it("renders without crashing", () => {
    render(
      <Experiment
        tasks={{
          ClickToAdvance,
          ProgressText,
          BlankTask,
        }}
        configuration={{ ...basicConfig }}
        saveState={null}
        loadState={null}
      />
    );

    screen.getByText("1 / 3");
  });

  it("renders correctly selected task", () => {
    render(
      <Experiment
        tasks={{
          ClickToAdvance,
          ProgressText,
          BlankTask,
        }}
        configuration={{ ...basicConfig }}
        saveState={null}
        loadState={null}
      />
    );

    screen.getByText("1 / 3");
    screen.getByText("advance").click();
    screen.getByText("2 / 3");
    screen.getByText("advance").click();
    screen.getByText("3 / 3");
  });

  it("renders correct depth parameter", () => {
    render(
      <Experiment
        tasks={{
          ClickToAdvance,
          ProgressText,
          BlankTask,
        }}
        configuration={{ ...advancedConfig }}
        saveState={null}
        loadState={null}
      />
    );
    screen.getByText("1 / 3");
    screen.getByText("advance").click();
    screen.getByText("2 / 3");
    screen.getByText("advance").click();
    screen.getByText("3 / 3");
    screen.getByText("advance").click();
    screen.getByText("1 / 2");
    screen.getByText("advance").click();
    screen.getByText("2 / 2");
  });

  it("renders correctly", () => {
    expect(
      render(
        <Experiment
          tasks={{
            ClickToAdvance,
            ProgressText,
            BlankTask,
          }}
          configuration={{ ...advancedConfig }}
          saveState={null}
          loadState={null}
        />
      ).asFragment()
    ).toMatchSnapshot();
  });
});
