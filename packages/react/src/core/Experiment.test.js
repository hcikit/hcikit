import React, { useState, useEffect, useRef } from "react";
import { mount } from "enzyme";
import Experiment, { saveStateToSessionStorage } from "./Experiment";
import DevTools from "../tasks/DevTools";
import DisplayText from "../tasks/DisplayTextTask";

const config = {
  tasks: ["AuxTask"],
  children: [
    {
      text: "hello",
      task: "ButtonTask",
    },
    {
      text: "hi",
      task: "ButtonTask",
    },
  ],
};

let RenderCounter = ({ numRendersBeforeContinue = 2, taskComplete }) => {
  let renders = useRef(0);

  useEffect(() => {
    renders.current++;
    if (renders.current >= numRendersBeforeContinue) {
      taskComplete();
    }
  });

  return null;
};

let LogOnClick = ({ log }) => (
  <button
    onClick={() => {
      log("log");
    }}
  />
);

let InfiniteRenderer = ({ log }) => <button onClick={log("log")} />;

/* eslint-disable react/prop-types */
let ButtonTask = ({
  taskComplete,
  modifyConfigAtDepth,
  text,
  log,
  logs,
  configVal = "hello",
}) => (
  <>
    <button
      onClick={() => {
        log({ hello: "world" });
        taskComplete();
      }}
    >
      {text}
    </button>
    <p className="logs">{logs}</p>
    <p className="modifyConfig">{configVal}</p>
    <span
      className="actuallyModifyConfig"
      onClick={() => modifyConfigAtDepth({ configVal: "world" })}
    >
      Modify Config
    </span>
  </>
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
    experiment = mount(
      <Experiment
        loadState={null}
        saveState={null}
        tasks={{ ButtonTask, AuxTask }}
        configuration={config}
      />
    );
  });

  it("renders the proper task", () => {
    expect(experiment.find("button").text()).toEqual(config.children[0].text);
  });

  it("advances to the next task", () => {
    experiment.find("button").simulate("click");
    expect(experiment.find("button").text()).toEqual(config.children[1].text);
  });

  it("works with empty tasks array", () => {
    const config = {
      content: "Hello",
      children: [
        {
          task: "DisplayText",
        },
      ],
    };

    mount(
      <Experiment
        tasks={{ DisplayText }}
        loadState={null}
        saveState={null}
        configuration={config}
      />
    );
  });

  it("continues to the end", () => {
    experiment.find("button").simulate("click");
    experiment.find("button").simulate("click");

    expect(experiment.find("h1").exists()).toBe(true);
    expect(experiment.find("h1").text()).toEqual(
      "You've completed the experiment!"
    );
  });

  it("tasks does not get bigger", () => {
    let Extender = ({ log, tasks, taskComplete }) => {
      expect(tasks).toEqual(["Blank"]);

      return <button onClick={taskComplete} />;
    };
    let Blank = () => null;
    const config = {
      tasks: [],
      content: "Hello",
      children: [
        {
          tasks: ["Blank"],

          children: [
            { task: "Extender" },
            { task: "Extender" },
            { task: "Extender" },
            { task: "Extender" },
          ],
        },
      ],
    };

    let experiment = mount(
      <Experiment
        tasks={{ Extender, DisplayText, Blank }}
        loadState={null}
        saveState={null}
        configuration={config}
      />
    );
    experiment.find("button").simulate("click");
    experiment.find("button").simulate("click");
  });

  it("logs definitely don't cause a re-render", () => {
    // TODO:
    // I added this test because I had a log() statement that occurred on render and it caused an infinite loop.
    // I *think* this is an issue with the withrawconfiguration, but I am not entirely convinced because devtools should not be renderering...
    // This issue only occurs when I have two levels of tasks in the configuration *and* there is a log statement in the renderer. I guess it is not an issue with withrawconfiguration.

    const config = {
      tasks: ["DisplayText"],
      content: "Hello",
      children: [{ tasks: ["DisplayText"], task: "InfiniteRenderer" }],
    };

    mount(
      <Experiment
        tasks={{ InfiniteRenderer, DevTools, DisplayText }}
        loadState={null}
        saveState={null}
        configuration={config}
      />
    );
  });

  it("logs don't cause a re-render", () => {
    const config = {
      children: [
        {
          tasks: ["LogOnClick", "RenderCounter"],
        },
      ],
    };

    let experiment = mount(
      <Experiment
        tasks={{ RenderCounter, LogOnClick }}
        loadState={null}
        saveState={null}
        configuration={config}
      />
    );

    experiment.find("button").simulate("click");

    expect(experiment.exists("h1")).toBeFalsy();
  });

  it("throws errors for unregistered tasks", () => {
    let consoleError = jest
      .spyOn(console, "error")
      .mockImplementation(() => {});

    const config = {
      children: [
        {
          times: 2,
          task: "MultiTask",
        },
      ],
    };

    expect(() => {
      mount(
        <Experiment loadState={null} saveState={null} configuration={config} />
      );
    }).toThrow(Error);

    expect(consoleError).toHaveBeenCalled();
  });

  describe("uses sessionStorage properly", () => {
    it("loads from empty localStorage", () => {
      let experiment = mount(
        <Experiment tasks={{ ButtonTask, AuxTask }} configuration={config} />
      );

      experiment.find("button").simulate("click");
      // TODO: this is kind of a hack.
      saveStateToSessionStorage.flush();

      experiment.unmount();

      experiment = mount(
        <Experiment tasks={{ ButtonTask, AuxTask }} configuration={config} />
      );

      expect(experiment.find("button").text()).toEqual(config.children[1].text);
    });
    // TODO: maybe a test making sure it is disabled for development?
  });

  describe("remounting", () => {
    it("remounts when forced remount", () => {
      const config = {
        children: [
          {
            times: 2,
            task: "MultiTask",
          },
          {
            times: 4,
            task: "MultiTask",
          },
        ],
      };

      experiment = mount(
        <Experiment
          loadState={null}
          saveState={null}
          forceRemountEveryTask
          tasks={{ MultiTask }}
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
            task: "MultiTask",
          },
          {
            times: 4,
            task: "MultiTask",
          },
        ],
      };

      experiment = mount(
        <Experiment
          loadState={null}
          saveState={null}
          forceRemountEveryTask={false}
          tasks={{ MultiTask }}
          configuration={config}
        />
      );

      experiment.find("button").simulate("click");
      experiment.find("button").simulate("click");
      expect(experiment.find("button").text()).toBe("2");
    });
  });

  // TODO:
  it("logs properly", () => {});

  it("doesn't pass logs to components", () => {
    experiment.find("button").simulate("click");
    expect(experiment.find("p.logs").text()).toEqual("");
  });

  it("modifies config properly", () => {
    expect(experiment.find(".modifyConfig").text()).toEqual("hello");

    experiment.find(".actuallyModifyConfig").simulate("click");
    expect(experiment.find(".modifyConfig").text()).toEqual("world");
  });
});
