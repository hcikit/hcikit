import Experiment from "./";
import React, { useState } from "react";
import { mount } from "enzyme";
import TaskRegistry from "./core/TaskRegistry";

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

/* eslint-disable react/prop-types */
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

/* eslint-disable react/prop-types */
let MultiTask = ({ taskComplete, times }) => {
  let [timesClicked, setTimesClicked] = useState(0);

  return (
    <button
      onClick={() => {
        setTimesClicked(timesClicked + 1);
        if (timesClicked + 1 >= times) {
          taskComplete();
        }
      }}
    >
      {timesClicked}
    </button>
  );
};

let AuxTask = () => <p>Hello World!</p>;

describe("Experiment", () => {
  let experiment;

  beforeEach(() => {
    let taskRegistry = new TaskRegistry({ ButtonTask });
    taskRegistry.registerTask("AuxTask", AuxTask);

    experiment = mount(
      <Experiment taskRegistry={taskRegistry} configuration={config} />
    );
  });

  it("renders the proper task", () => {
    expect(experiment.find("button").text()).toEqual(config.children[0].text);
  });

  it("advances to the next task", () => {
    experiment.find("button").simulate("click");
    expect(experiment.find("button").text()).toEqual(config.children[1].text);
  });

  it("continues to the end", () => {
    experiment.find("button").simulate("click");
    experiment.find("button").simulate("click");

    expect(experiment.find("h1").exists()).toBe(true);
    expect(experiment.find("h1").text()).toEqual(
      "You've completed the experiment!"
    );
  });

  it("throws errors for unregistered tasks", () => {
    jest.spyOn(console, "error").mockImplementation(() => {});

    const config = {
      children: [
        {
          times: 2,
          task: "MultiTask"
        }
      ]
    };

    let error;
    try {
      mount(
        <Experiment taskRegistry={new TaskRegistry()} configuration={config} />
      );
    } catch (e) {
      error = e;
    }
    expect(error).toBeInstanceOf(Error);
  });

  describe("remounting", () => {
    it("remounts when forced remount", () => {
      const config = {
        children: [
          {
            times: 2,
            task: "MultiTask"
          },
          {
            times: 4,
            task: "MultiTask"
          }
        ]
      };

      experiment = mount(
        <Experiment
          forceRemountEveryTask
          taskRegistry={new TaskRegistry({ MultiTask })}
          configuration={config}
        />
      );

      experiment.find("button").simulate("click");
      experiment.find("button").simulate("click");
      expect(experiment.find("button").text()).toBe("0");
    });

    it("won't remount when not forced", () => {
      const config = {
        children: [
          {
            times: 2,
            task: "MultiTask"
          },
          {
            times: 4,
            task: "MultiTask"
          }
        ]
      };

      experiment = mount(
        <Experiment
          forceRemountEveryTask={false}
          taskRegistry={new TaskRegistry({ MultiTask })}
          configuration={config}
        />
      );

      experiment.find("button").simulate("click");
      experiment.find("button").simulate("click");
      expect(experiment.find("button").text()).toBe("2");
    });
  });

  // it("passes all props", () => {
  //   fail()

  // })

  it("logs properly", () => {});

  // it("doesn't pass logs to components", () => {
  //   fail()
  // })
});
