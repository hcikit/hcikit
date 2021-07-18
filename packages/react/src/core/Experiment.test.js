import React, { useState, useEffect, useRef } from "react";
import Experiment, {
  saveStateToSessionStorage,
  useExperiment,
} from "./Experiment";
import DevTools from "../tasks/DevTools";
import DisplayText from "../tasks/DisplayTextTask";
import { render, screen, cleanup } from "@testing-library/react";

const config = {
  tasks: ["AuxTask"],
  children: [
    {
      text: "button task 1",
      task: "ButtonTask",
    },
    {
      text: "button task 2",
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

  return <span data-testid="render-counter" />; //{renders}</span>;; // <span data-testid="renders">{renders}</span>;
};

let LogOnClick = ({ log }) => (
  <button
    onClick={() => {
      log("log");
    }}
  >
    Button
  </button>
);

let InfiniteRenderer = ({ log }) => {
  log("log");
  return <button>Log</button>;
};

/* eslint-disable react/prop-types */
let ButtonTask = ({ taskComplete, text, logs, configVal = "hello" }) => {
  let { log, modifyConfigAtDepth } = useExperiment();
  return (
    <>
      <button
        onClick={() => {
          log({ hello: "world" });
          taskComplete();
        }}
      >
        {text}
      </button>
      <p className="logs" data-testid="logs">
        {logs}
      </p>
      <p className="modifyConfig">{configVal}</p>
      <span
        className="actuallyModifyConfig"
        onClick={() => modifyConfigAtDepth({ configVal: "world" })}
      >
        Modify Config
      </span>
    </>
  );
};

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

let AuxTask = () => <p>Aux Task.</p>;

describe("Experiment", () => {
  it("renders the proper task", () => {
    render(
      <Experiment
        loadState={null}
        saveState={null}
        tasks={{ ButtonTask, AuxTask }}
        configuration={config}
      />
    );

    screen.getByText(config.children[0].text);
  });

  it("advances to the next task", () => {
    render(
      <Experiment
        loadState={null}
        saveState={null}
        tasks={{ ButtonTask, AuxTask }}
        configuration={config}
      />
    );

    screen.getByText("button task 1").click();
    screen.getByText(config.children[1].text);
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

    render(
      <Experiment
        tasks={{ DisplayText }}
        loadState={null}
        saveState={null}
        configuration={config}
      />
    );
    screen.getByText(config.content);
  });

  it("continues to the end", () => {
    render(
      <Experiment
        tasks={{ ButtonTask, AuxTask }}
        loadState={null}
        saveState={null}
        configuration={config}
      />
    );

    screen.getByText("button task 1").click();
    screen.getByText("button task 2").click();
    screen.getByText("You've completed the experiment!");
  });

  it("tasks does not get bigger", () => {
    let Extender = ({ tasks, taskComplete }) => {
      expect(tasks).toEqual(["Blank"]);

      return <button onClick={taskComplete}>Extender</button>;
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

    render(
      <Experiment
        tasks={{ Extender, DisplayText, Blank }}
        loadState={null}
        saveState={null}
        configuration={config}
      />
    );
    screen.getByText("Extender").click();
    screen.getByText("Extender").click();
    screen.getByText("Extender").click();
  });

  // TODO: this test is broken because log causes a state change in the infiniterenderer and this means they both render at once because of the infinite

  xit("logs definitely don't cause a re-render", () => {
    // TODO:
    // I added this test because I had a log() statement that occurred on render and it caused an infinite loop.
    const config = {
      tasks: ["DisplayText"],
      content: "Hello",
      children: [
        { tasks: ["DisplayText", "RenderCounter"], task: "InfiniteRenderer" },
      ],
    };

    render(
      <Experiment
        tasks={{ InfiniteRenderer, DevTools, DisplayText, RenderCounter }}
        loadState={null}
        saveState={null}
        configuration={config}
      />
    );

    screen.getByTestId("render-counter");
  });

  it("logs don't cause a re-render", () => {
    const config = {
      children: [
        {
          tasks: ["LogOnClick", "RenderCounter"],
        },
      ],
    };

    render(
      <Experiment
        tasks={{ RenderCounter, LogOnClick }}
        loadState={null}
        saveState={null}
        configuration={config}
      />
    );

    screen.getByText("Button").click();
    screen.getByText("Button").click();
    screen.getByText("Button").click();
    screen.getByText("Button").click();
    screen.getByTestId("render-counter");
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
      render(
        <Experiment loadState={null} saveState={null} configuration={config} />
      );
    }).toThrow(Error);

    expect(consoleError).toHaveBeenCalled();
  });

  describe("uses sessionStorage properly", () => {
    it("loads from empty localStorage", () => {
      render(
        <Experiment tasks={{ ButtonTask, AuxTask }} configuration={config} />
      );

      screen.getByText("button task 1").click();
      // TODO: this is kind of a hack.
      saveStateToSessionStorage.flush();

      cleanup();
      render(
        <Experiment tasks={{ ButtonTask, AuxTask }} configuration={config} />
      );
      screen.getByText(config.children[1].text);
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

      render(
        <Experiment
          loadState={null}
          saveState={null}
          forceRemountEveryTask
          tasks={{ MultiTask }}
          configuration={config}
        />
      );
      screen.getByText("0").click();
      screen.getByText("1").click();
      screen.getByText("0").click();
      screen.getByText("1").click();
      screen.getByText("2").click();
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

      render(
        <Experiment
          loadState={null}
          saveState={null}
          forceRemountEveryTask={false}
          tasks={{ MultiTask }}
          configuration={config}
        />
      );
      screen.getByText("0").click();
      screen.getByText("1").click();
      screen.getByText("2").click();
      screen.getByText("3").click();
    });
  });

  // TODO:
  it("logs properly", () => {});

  it("doesn't pass logs to components", () => {
    render(
      <Experiment
        loadState={null}
        saveState={null}
        tasks={{ ButtonTask, AuxTask }}
        configuration={config}
      />
    );

    expect(screen.getByTestId("logs")).toBeEmptyDOMElement();
    screen.getByText("button task 1").click();
    expect(screen.getByTestId("logs")).toBeEmptyDOMElement();
  });

  it("modifies config properly", () => {
    render(
      <Experiment
        loadState={null}
        saveState={null}
        tasks={{ ButtonTask, AuxTask }}
        configuration={config}
      />
    );

    screen.getByText("hello");
    screen.getByText("Modify Config").click();
    screen.getByText("world");
  });
});
