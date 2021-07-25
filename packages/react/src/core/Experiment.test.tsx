import React, { useState, useEffect, useRef } from "react";
import Experiment, {
  saveStateToSessionStorage,
  useConfig,
  useExperiment,
} from "./Experiment";
import DevTools from "../tasks/DevTools";
import DisplayText from "../tasks/DisplayTextTask";
import { render, screen, cleanup } from "@testing-library/react";
import { Configuration, Log } from "@hcikit/workflow";
import userEvent from "@testing-library/user-event";

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
      experiment.advance();
    }
  });

  return <span data-testid="render-counter" />; //{renders}</span>;; // <span data-testid="renders">{renders}</span>;
};

const LogOnClick: React.FunctionComponent = () => {
  const experiment = useExperiment();
  return (
    <button
      onClick={() => {
        experiment.log({ type: "log" });
      }}
    >
      Button
    </button>
  );
};

const InfiniteRenderer: React.FunctionComponent = () => {
  const experiment = useExperiment();
  experiment.log({ type: "log" });
  return <button>Log</button>;
};

const AdvanceTask: React.FunctionComponent<{ text: string }> = ({ text }) => {
  let experiment = useExperiment();
  return <button onClick={() => experiment.advance()}>{text}</button>;
};

/* eslint-disable react/prop-types */
const ButtonTask: React.FunctionComponent<{
  text: string;
  logs: Array<Log>;
  configVal: string;
}> = ({ text, logs, configVal = "hello" }) => {
  const configuration = useConfig();
  const { log, modify, advance } = useExperiment();
  return (
    <>
      <button
        onClick={() => {
          log({ hello: "world", type: "log" });
          advance();
        }}
      >
        {text}
      </button>
      <p className="logs" data-testid="logs">
        {logs}
      </p>
      <p>{configVal}</p>
      <span onClick={() => modify({ configVal: "world" })}>Modify Config</span>
      <p>{configuration.children?.[1].foo as string}</p>
      <span onClick={() => modify({ foo: "bar" }, [1])}>at index</span>
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
          experiment.advance();
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

  it("advances to an arbitrary task", () => {
    render(
      <Experiment
        loadState={null}
        saveState={null}
        tasks={{
          FarIndexTask: () => {
            let { advance } = useExperiment();
            return <button onClick={() => advance([1, 2])}>advance</button>;
          },
          Displayer: ({ index }) => <div>{index.toString()}</div>,
        }}
        configuration={{
          tasks: ["FarIndexTask", "Displayer"],
          children: [
            { index: "0" },
            {
              children: [{ index: "1,0" }, { index: "1,1" }, { index: "1,2" }],
            },
          ],
        }}
      />
    );

    screen.getByText("advance").click();
    screen.getByText("1,2");
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

      return <button onClick={() => experiment.advance()}>Extender</button>;
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

  // this test is broken because log causes a state change in the infiniterenderer and this means they both render at once because of the infinite

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

    it("doesn't load when no loadstate is given", () => {
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

    it("doesn't save when no savestate is given", () => {
      render(
        <Experiment
          saveState={null}
          loadState={null}
          tasks={{ ButtonTask, AuxTask }}
          configuration={{ ...config }}
        />
      );

      screen.getByText("button task 1").click();

      expect(window.sessionStorage.length).toBe(0);
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

  it("two tasks with button don't go to the end", () => {
    render(
      <Experiment
        loadState={null}
        saveState={null}
        tasks={{ ButtonTask }}
        configuration={{
          children: [
            { task: "ButtonTask", text: "button" },
            { task: "ButtonTask", text: "button" },
          ],
        }}
      />
    );
    screen.getByText("button").click();
    screen.getByText("button").click();
    screen.getByText("You've completed the experiment!");
  });

  it("two tasks with button don't go to the end", () => {
    render(
      <Experiment
        tasks={{ AdvanceTask }}
        configuration={{
          children: [
            { task: "AdvanceTask", text: "button" },
            { task: "AdvanceTask", text: "button" },
          ],
        }}
      />
    );

    screen.getByText("button").click();
    screen.getByText("button").click();
    screen.getByText("You've completed the experiment!");
  });

  it("logs properly", () => {
    let Logger = () => {
      const { log, modify } = useExperiment();
      const [logValue, setLogValue] = useState("");
      return (
        <div>
          <input
            data-testid="log-value"
            type="text"
            value={logValue}
            onChange={(e) => setLogValue(e.target.value)}
          />
          <button onClick={() => log({ logValue, type: "log" })}>
            log as object
          </button>
          <button onClick={() => modify({ newConfig: "help" })}>
            modify config
          </button>
        </div>
      );
    };

    let configuration: Configuration = {
      tasks: ["Logger"],
      children: [
        { task: "AdvanceTask", text: "button1" },
        { task: "AdvanceTask", text: "button2" },
      ],
    };

    let i = 0;
    jest.spyOn(Date, "now").mockImplementation(() => i++);

    render(
      <Experiment
        loadState={null}
        saveState={null}
        tasks={{ Logger, AdvanceTask }}
        configuration={configuration}
      />
    );

    userEvent.type(screen.getByTestId("log-value"), "logObject");
    screen.getByText("log as object").click();

    screen.getByText("button1").click();
    screen.getByText("modify config").click();

    screen.getByText("button2").click();

    let json = decodeURIComponent(
      screen
        .getByText("Download experiment log")
        .closest("a")
        ?.href.replace("data:text/json;charset=utf-8,", "") || ""
    );

    let filledConfig: Configuration = JSON.parse(json) as Configuration;

    expect(filledConfig.children?.[0].logs).toEqual([
      { type: "START", timestamp: 0 },
      { type: "log", logValue: "logObject", timestamp: 1 },
      { type: "END", timestamp: 2 },
    ]);

    expect(filledConfig.children?.[1].logs).toEqual([
      { type: "START", timestamp: 3 },
      {
        type: "MODIFY_CONFIGURATION",
        timestamp: 4,
        from: {},
        to: { newConfig: "help" },
        index: [1],
      },
      { type: "END", timestamp: 5 },
    ]);

    jest.restoreAllMocks();
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

    screen.getByText("at index").click();
    screen.getByText("bar");
  });
});
