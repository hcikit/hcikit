import React from "react";
import WizardProgress from "./WizardProgress";
import { render, screen } from "@testing-library/react";
import Experiment, { useExperiment } from "../core/Experiment";
import { Configuration } from "@hcikit/workflow";

let BlankTask: React.FunctionComponent = () => null;

let basicConfig: Configuration = {
  __INDEX__: [0],
  tasks: ["WizardProgress"],
  children: [
    { label: "hello world", task: "BlankTask" },
    { task: "BlankTask" },
    { label: "labels", task: "BlankTask" },
  ],
};

let advancedConfig: Configuration = {
  tasks: ["WizardProgress"],
  depth: 1,

  children: [
    {
      label: "hello world",
      children: [
        { label: "0,0", task: "BlankTask" },
        { label: "0,1", task: "BlankTask" },
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
  return <button onClick={experiment.taskComplete}>advance</button>;
};

describe("WizardProgress", () => {
  it("renders without crashing", () => {
    render(
      <Experiment
        tasks={{
          ClickToAdvance,
          WizardProgress,
          BlankTask,
        }}
        configuration={{ ...basicConfig }}
        saveState={null}
        loadState={null}
      />
    );

    expect(screen.getByText("hello world")).toHaveClass("MuiStepLabel-active");
    expect(screen.getByText("Blank Task")).not.toHaveClass(
      "MuiStepLabel-active"
    );
    expect(screen.getByText("labels")).not.toHaveClass("MuiStepLabel-active");
  });

  it("renders correctly selected task", () => {
    render(
      <Experiment
        tasks={{
          ClickToAdvance,
          WizardProgress,
          BlankTask,
        }}
        configuration={{ ...basicConfig, __INDEX__: [1] }}
        saveState={null}
        loadState={null}
      />
    );

    expect(screen.getByText("hello world")).not.toHaveClass(
      "MuiStepLabel-active"
    );
    expect(screen.getByText("Blank Task")).toHaveClass("MuiStepLabel-active");
    expect(screen.getByText("labels")).not.toHaveClass("MuiStepLabel-active");
  });

  it("renders correct depth parameter", () => {
    render(
      <Experiment
        tasks={{
          ClickToAdvance,
          WizardProgress,
          BlankTask,
        }}
        configuration={{ ...advancedConfig }}
        saveState={null}
        loadState={null}
      />
    );
    expect(screen.getByText("0,0")).toHaveClass("MuiStepLabel-active");
    expect(screen.getByText("0,1")).not.toHaveClass("MuiStepLabel-active");
  });
  it("renders correct depth parameter with second one", () => {
    render(
      <Experiment
        tasks={{
          ClickToAdvance,
          WizardProgress,
          BlankTask,
        }}
        configuration={{ ...advancedConfig, __INDEX__: [1, 0] }}
        saveState={null}
        loadState={null}
      />
    );

    expect(screen.getByText("1,0")).toHaveClass("MuiStepLabel-active");
    screen.getByText("1,1");
  });

  it("renders correctly", () => {
    expect(
      render(
        <Experiment
          tasks={{
            ClickToAdvance,
            WizardProgress,
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
