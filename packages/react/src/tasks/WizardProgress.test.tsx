import React from "react";
import WizardProgress from "./WizardProgress.js";
import { render, screen } from "@testing-library/react";
import Experiment, { useExperiment } from "../core/Experiment.js";
import { Configuration } from "@hcikit/workflow";
import userEvent from "@testing-library/user-event";

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
  tasks: ["WizardProgress", "ClickToAdvance"],
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

let skipConfig: Configuration = {
  tasks: ["WizardProgress", "ClickToAdvance"],
  children: [
    { label: "[0]", task: "BlankTask" },
    { label: "[1]", task: "BlankTask" },
    { label: "[2]", task: "BlankTask", skip: true },
    { label: "[3]", task: "BlankTask", skip: true },
    { label: "[4]", task: "BlankTask" },
    { label: "[5]", task: "BlankTask", skip: true },
    { label: "[6]", task: "BlankTask" },
  ],
};

let ClickToAdvance: React.FunctionComponent = () => {
  const experiment = useExperiment();
  return <button onClick={() => experiment.advance()}>advance</button>;
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

    expect(screen.getByText("hello world")).toHaveClass("Mui-active");
    expect(screen.getByText("Blank Task")).not.toHaveClass("Mui-active");
    expect(screen.getByText("labels")).not.toHaveClass("Mui-active");
  });

  it("Skips skipped tasks and doesn't break", async () => {
    render(
      <Experiment
        tasks={{
          ClickToAdvance,
          WizardProgress,
          BlankTask,
        }}
        configuration={{ ...skipConfig }}
        saveState={null}
        loadState={null}
      />
    );

    let task2 = screen.queryByText("[2]");
    let task3 = screen.queryByText("[3]");
    let task5 = screen.queryByText("[5]");

    expect(task2).not.toBeInTheDocument();
    expect(task3).not.toBeInTheDocument();
    expect(task5).not.toBeInTheDocument();

    expect(screen.getByText("[0]")).toHaveClass("Mui-active");
    await userEvent.click(screen.getByText("advance"));
    await userEvent.click(screen.getByText("advance"));

    task2 = screen.queryByText("[2]");
    task3 = screen.queryByText("[3]");
    task5 = screen.queryByText("[5]");
    expect(task2).not.toBeInTheDocument();
    expect(task3).not.toBeInTheDocument();
    expect(task5).not.toBeInTheDocument();

    expect(screen.getByText("[1]")).toHaveClass("Mui-active");
    await userEvent.click(screen.getByText("advance"));
    expect(screen.getByText("[1]")).toHaveClass("Mui-active");
    await userEvent.click(screen.getByText("advance"));
    expect(screen.getByText("[4]")).toHaveClass("Mui-active");
    await userEvent.click(screen.getByText("advance"));
    expect(screen.getByText("[4]")).toHaveClass("Mui-active");
    await userEvent.click(screen.getByText("advance"));
    expect(screen.getByText("[6]")).toHaveClass("Mui-active");

    task2 = screen.queryByText("[2]");
    task3 = screen.queryByText("[3]");
    task5 = screen.queryByText("[5]");
    expect(task2).not.toBeInTheDocument();
    expect(task3).not.toBeInTheDocument();
    expect(task5).not.toBeInTheDocument();
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

    expect(screen.getByText("hello world")).not.toHaveClass("Mui-active");
    expect(screen.getByText("Blank Task")).toHaveClass("Mui-active");
    expect(screen.getByText("labels")).not.toHaveClass("Mui-active");
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
    expect(screen.getByText("0,0")).toHaveClass("Mui-active");
    expect(screen.getByText("0,1")).not.toHaveClass("Mui-active");
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

    expect(screen.getByText("1,0")).toHaveClass("Mui-active");
    screen.getByText("1,1");
  });

  it("updates properly", async () => {
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

    expect(screen.getByText("0,0")).toHaveClass("Mui-active");
    await userEvent.click(screen.getByText("advance"));
    expect(screen.getByText("0,1")).toHaveClass("Mui-active");
    await userEvent.click(screen.getByText("advance"));
    expect(screen.getByText("1,0")).toHaveClass("Mui-active");
    await userEvent.click(screen.getByText("advance"));
    expect(screen.getByText("1,1")).toHaveClass("Mui-active");
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
