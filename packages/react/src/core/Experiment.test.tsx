import React, { useState, useEffect, useRef } from "react";
import Experiment, {
  saveStateToSessionStorage,
  useExperiment,
} from "./Experiment";
import DevTools from "../tasks/DevTools";
import DisplayText from "../tasks/DisplayTextTask";
import { render, screen, cleanup } from "@testing-library/react";
import { Log } from "@hcikit/workflow";

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

const RenderCounter: React.FunctionComponent<{
  numRendersBeforeContinue: number;
  // eslint-disable-next-line react/prop-types
}> = ({ numRendersBeforeContinue = 2 }) => {
  const experiment = useExperiment();
  const renders = useRef(0);

  useEffect(() => {
    renders.current++;

    if (renders.current >= numRendersBeforeContinue) {
      experiment.taskComplete();
    }
  });

  return <span data-testid="render-counter" />; //{renders}</span>;; // <span data-testid="renders">{renders}</span>;
};

const LogOnClick: React.FunctionComponent = () => {
  const experiment = useExperiment();
  return (
    <button
      onClick={() => {
        experiment.log("log");
      }}
    >
      Button
    </button>
  );
};

const InfiniteRenderer: React.FunctionComponent = () => {
  const experiment = useExperiment();
  experiment.log("log");
  return <button>Log</button>;
};

/* eslint-disable react/prop-types */
const ButtonTask: React.FunctionComponent<{
  text: string;
  logs: Array<Log>;
  configVal: string;
}> = ({ text, logs, configVal = "hello" }) => {
  const { log, modifyConfigAtDepth, taskComplete } = useExperiment();
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
const MultiTask: React.FunctionComponent<{ times: number }> = ({ times }) => {
  const [timesClicked, setTimesClicked] = useState(0);
  const experiment = useExperiment();
  return (
    <button
      onClick={() => {
        setTimesClicked(timesClicked + 1);
        if (timesClicked + 1 >= times) {
          experiment.taskComplete();
        }
      }}
    >
      {timesClicked}
    </button>
  );
};

const AuxTask = () => <p>Aux Task.</p>;

describe("Experiment", () => {
  it("renders the proper task", () => {
    render(
      <Experiment
        loadState={null}
        saveState={null}
        tasks={{ ButtonTask, AuxTask }}
        configuration={{ ...config }}
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
        configuration={{ ...config }}
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
        configuration={{ ...config }}
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
        configuration={{ ...config }}
      />
    );

    screen.getByText("button task 1").click();
    screen.getByText("button task 2").click();
    screen.getByText("You've completed the experiment!");
  });

  it("tasks does not get bigger", () => {
    const Extender: React.FunctionComponent<{ tasks: Array<string> }> = ({
      tasks,
    }) => {
      const experiment = useExperiment();
      expect(tasks).toEqual(["Blank"]);

      return <button onClick={experiment.taskComplete}>Extender</button>;
    };

    const Blank = () => null;

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
        configuration={{ ...config }}
      />
    );
    screen.getByText("Extender").click();
    screen.getByText("Extender").click();
    screen.getByText("Extender").click();
  });

  // TODO: this test is broken because log causes a state change in the infiniterenderer and this means they both render at once because of the infinite

  xit("logs definitely don't cause a re-render", () => {
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
        configuration={{ ...config }}
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
        configuration={{ ...config }}
      />
    );

    screen.getByText("Button").click();
    screen.getByText("Button").click();
    screen.getByText("Button").click();
    screen.getByText("Button").click();
    screen.getByText("Button").click();
    screen.getByText("Button").click();
    screen.getByTestId("render-counter");
  });

  it("throws errors for unregistered tasks", () => {
    const consoleError = jest.spyOn(console, "error").mockImplementation(() => {
      //do nothing
    });

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
        <Experiment
          loadState={null}
          saveState={null}
          configuration={{ ...config }}
          tasks={{}}
        />
      );
    }).toThrow(Error);

    expect(consoleError).toHaveBeenCalled();
  });

  describe("uses sessionStorage properly", () => {
    it("loads from empty localStorage", () => {
      render(
        <Experiment
          tasks={{ ButtonTask, AuxTask }}
          configuration={{ ...config }}
        />
      );

      screen.getByText("button task 1").click();

      saveStateToSessionStorage.flush();

      cleanup();
      render(
        <Experiment
          tasks={{ ButtonTask, AuxTask }}
          configuration={{ ...config }}
        />
      );
      screen.getByText(config.children[1].text);
    });

    it("doesn't load when no task is given", () => {
      render(
        <Experiment
          tasks={{ ButtonTask, AuxTask }}
          configuration={{ ...config }}
        />
      );

      screen.getByText("button task 1").click();
      saveStateToSessionStorage.flush();

      cleanup();

      render(
        <Experiment
          loadState={null}
          saveState={null}
          tasks={{ ButtonTask, AuxTask }}
          configuration={{ ...config }}
        />
      );
      screen.getByText("button task 1");
    });

    afterEach(() => {
      window.sessionStorage.clear();
    });
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
          configuration={{ ...config }}
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
          configuration={{ ...config }}
        />
      );
      screen.getByText("0").click();
      screen.getByText("1").click();
      screen.getByText("2").click();
      screen.getByText("3").click();
    });
  });

  xit("logs properly", () => {
    // do nothing
  });

  it("doesn't pass logs to components", () => {
    render(
      <Experiment
        loadState={null}
        saveState={null}
        tasks={{ ButtonTask, AuxTask }}
        configuration={{ ...config }}
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
        configuration={{ ...config }}
      />
    );

    screen.getByText("hello");
    screen.getByText("Modify Config").click();
    screen.getByText("world");
  });
});
