import React, { useState, useEffect, useRef } from "react";
import Experiment, { useConfiguration, useExperiment } from "./Experiment.js";
import DevTools from "../tasks/DevTools.js";
import DisplayText from "../tasks/DisplayTextTask.js";
import {
  render,
  screen,
  cleanup,
  act,
  waitForElementToBeRemoved,
} from "@testing-library/react";
import { Configuration, Log } from "@hcikit/workflow";
import userEvent from "@testing-library/user-event";
import { FallbackProps } from "react-error-boundary";
import { jest } from "@jest/globals";
import { BasePersistence, StoragePersistence } from "../persistence/index.js";

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

class PersistenceTester extends BasePersistence {
  resolve = (config: Configuration | undefined) => {};
  config: Configuration | undefined = {};
  load = () => {
    return new Promise<Configuration | undefined>((resolve) => {
      this.resolve = resolve;
    });
  };
  async save(configuration: Configuration) {
    this.config = configuration;
  }
  async clear(): Promise<void> {
    this.config = undefined;
  }
  async init(): Promise<void> {
    this.config = undefined;
  }
}

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

  useEffect(() => {
    experiment.log({ type: "log" });
  });

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
  const configuration = useConfiguration();
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
        {/* @ts-ignore */}
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
        persistence={null}
        tasks={{ ButtonTask, AuxTask }}
        configuration={{ ...config }}
      />
    );

    screen.getByText(config.children[0].text);
  });

  it("advances to the next task", async () => {
    render(
      <Experiment
        persistence={null}
        tasks={{ ButtonTask, AuxTask }}
        configuration={{ ...config }}
      />
    );

    await userEvent.click(screen.getByText("button task 1"));

    screen.getByText(config.children[1].text);
  });

  it("advances to an arbitrary task", async () => {
    render(
      <Experiment
        persistence={null}
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

    await userEvent.click(screen.getByText("advance"));
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
        persistence={null}
        configuration={{ ...config }}
      />
    );
    screen.getByText(config.content);
  });

  it("continues to the end", async () => {
    render(
      <Experiment
        tasks={{ ButtonTask, AuxTask }}
        persistence={null}
        configuration={{ ...config }}
      />
    );

    await userEvent.click(screen.getByText("button task 1"));
    await userEvent.click(screen.getByText("button task 2"));
    screen.getByText("You've completed the experiment!");
  });

  it("tasks does not get bigger", async () => {
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
        persistence={null}
        configuration={{ ...config }}
      />
    );
    await userEvent.click(screen.getByText("Extender"));
    await userEvent.click(screen.getByText("Extender"));
    await userEvent.click(screen.getByText("Extender"));
  });

  // this test is broken because log causes a state change in the infiniterenderer and this means they both render at once because of the infinite

  it("logs definitely don't cause a re-render", () => {
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
        persistence={null}
        configuration={{ ...config }}
      />
    );

    screen.getByTestId("render-counter");
  });

  it("logs don't cause a re-render", async () => {
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
        persistence={null}
        configuration={{ ...config }}
      />
    );

    await userEvent.click(screen.getByText("Button"));
    await userEvent.click(screen.getByText("Button"));
    await userEvent.click(screen.getByText("Button"));
    await userEvent.click(screen.getByText("Button"));
    await userEvent.click(screen.getByText("Button"));
    await userEvent.click(screen.getByText("Button"));
    screen.getByTestId("render-counter");
  });

  it("throws errors for unregistered tasks", () => {
    jest.spyOn(console, "error").mockImplementation(() => {
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

    render(
      <Experiment persistence={null} configuration={{ ...config }} tasks={{}} />
    );

    screen.getByText(
      "The task MultiTask was not found. Make sure you are passing it in to the <Experiment> component in the tasks prop.",
      { exact: false }
    );

    jest.restoreAllMocks();
  });

  describe("loads config from promise", () => {
    it("shows a loading screen while loading that goes away after loading", async () => {
      let resolveLoad: (config: Configuration) => void;

      let configPromise = new Promise<Configuration>((resolve) => {
        resolveLoad = resolve;
      });

      let configToUse = { ...config };
      render(
        <Experiment
          tasks={{ ButtonTask, AuxTask }}
          configuration={configPromise}
          persistence={null}
        />
      );

      // TODO: make sure we only see the loading screen.
      // resolve the promise
      // test to make sure we can advance through the experiment
      screen.getByText("Loading experiment configuration...");
      // @ts-ignore
      await act(async () => await resolveLoad(configToUse));
      screen.getByText("button task 1");
    });
  });

  describe("persists properly", () => {
    it("doesn't show loading when no persistence is given", async () => {
      render(
        <Experiment
          tasks={{ ButtonTask, AuxTask }}
          configuration={{ ...config }}
          persistence={null}
        />
      );

      screen.getByText("button task 1");
    });

    it("persists in development when asked", async () => {
      // @ts-ignore
      process.env.NODE_ENV = "development";
      let persistence = new StoragePersistence();
      render(
        <Experiment
          tasks={{ ButtonTask, AuxTask }}
          configuration={{ ...config }}
          persistence={persistence}
          devOptions={{ persistInDevelopment: true, useIndexFromUrl: true }}
        />
      );

      await waitForElementToBeRemoved(() => screen.queryByText(/loading/i));

      await userEvent.click(screen.getByText("button task 1"));

      persistence.flush();

      cleanup();
      render(
        <Experiment
          tasks={{ ButtonTask, AuxTask }}
          configuration={{ ...config }}
          persistence={persistence}
          devOptions={{ persistInDevelopment: true, useIndexFromUrl: true }}
        />
      );
      await waitForElementToBeRemoved(() => screen.queryByText(/loading/i));

      screen.getByText(config.children[1].text);
      // @ts-ignore
      process.env.NODE_ENV = "test";
    });

    it("does not persist in development", async () => {
      // @ts-ignore
      process.env.NODE_ENV = "development";

      let persistence = new StoragePersistence();
      render(
        <Experiment
          tasks={{ ButtonTask, AuxTask }}
          configuration={{ ...config }}
          persistence={persistence}
        />
      );

      await userEvent.click(screen.getByText("button task 1"));

      persistence.flush();

      cleanup();
      render(
        <Experiment
          tasks={{ ButtonTask, AuxTask }}
          configuration={{ ...config }}
          persistence={persistence}
        />
      );

      screen.getByText("button task 1");
      // @ts-ignore
      process.env.NODE_ENV = "test";
    });

    it("shows a loading screen while loading that goes away after loading", async () => {
      let persistence = new PersistenceTester();
      let configToUse = { ...config };
      render(
        <Experiment
          tasks={{ ButtonTask, AuxTask }}
          configuration={configToUse}
          persistence={persistence}
        />
      );

      // TODO: make sure we only see the loading screen.
      // resolve the promise
      // test to make sure we can advance through the experiment
      screen.getByText("Loading experiment configuration...");
      await act(async () => await persistence.resolve(configToUse));
      screen.getByText("button task 1");
    });

    it("loads from empty localStorage", async () => {
      let persistence = new PersistenceTester();
      render(
        <Experiment
          tasks={{ ButtonTask, AuxTask }}
          configuration={{ ...config }}
          persistence={persistence}
        />
      );
      screen.queryByText(/loading/i);
      await act(async () => await persistence.resolve({ ...config }));

      await userEvent.click(screen.getByText("button task 1"));
      screen.getByText(config.children[1].text);

      persistence.flush();
      console.log(persistence.config);

      cleanup();
      render(
        <Experiment
          tasks={{ ButtonTask, AuxTask }}
          configuration={{ ...config }}
          persistence={persistence}
        />
      );
      screen.queryByText(/loading/i);
      await act(async () => await persistence.resolve(persistence.config));

      screen.getByText(config.children[1].text);
    });

    afterEach(() => {
      window.sessionStorage.clear();
    });
  });

  describe("remounting", () => {
    it("remounts when forced remount", async () => {
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
          persistence={null}
          forceRemountEveryTask
          tasks={{ MultiTask }}
          configuration={{ ...config }}
        />
      );

      await userEvent.click(screen.getByText("0"));
      await userEvent.click(screen.getByText("1"));
      await userEvent.click(screen.getByText("0"));
      await userEvent.click(screen.getByText("1"));
      await userEvent.click(screen.getByText("2"));
    });

    it("won't remount when not forced", async () => {
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
          persistence={null}
          forceRemountEveryTask={false}
          tasks={{ MultiTask }}
          configuration={{ ...config }}
        />
      );
      await userEvent.click(screen.getByText("0"));
      await userEvent.click(screen.getByText("1"));
      await userEvent.click(screen.getByText("2"));
      await userEvent.click(screen.getByText("3"));
    });
  });

  it("two tasks with button don't go to the end", async () => {
    render(
      <Experiment
        persistence={null}
        tasks={{ ButtonTask }}
        configuration={{
          children: [
            { task: "ButtonTask", text: "button" },
            { task: "ButtonTask", text: "button" },
          ],
        }}
      />
    );
    await userEvent.click(screen.getByText("button"));
    await userEvent.click(screen.getByText("button"));
    screen.getByText("You've completed the experiment!");
  });

  it("logs properly", async () => {
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
        persistence={null}
        tasks={{ Logger, AdvanceTask }}
        configuration={configuration}
      />
    );

    await userEvent.type(screen.getByTestId("log-value"), "logObject");
    await userEvent.click(screen.getByText("log as object"));

    await userEvent.click(screen.getByText("button1"));
    await userEvent.click(screen.getByText("modify config"));

    await userEvent.click(screen.getByText("button2"));

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

  it("doesn't pass logs to components", async () => {
    render(
      <Experiment
        persistence={null}
        tasks={{ ButtonTask, AuxTask }}
        configuration={{ ...config }}
      />
    );

    expect(screen.getByTestId("logs")).toBeEmptyDOMElement();
    await userEvent.click(screen.getByText("button task 1"));
    expect(screen.getByTestId("logs")).toBeEmptyDOMElement();
  });

  it("modifies config properly", async () => {
    render(
      <Experiment
        persistence={null}
        tasks={{ ButtonTask, AuxTask }}
        configuration={{ ...config }}
      />
    );

    screen.getByText("hello");
    await userEvent.click(screen.getByText("Modify Config"));
    screen.getByText("world");

    await userEvent.click(screen.getByText("at index"));
    screen.getByText("bar");
  });
  it("modify can add children", async () => {
    const AddChildren = () => {
      const { modify } = useExperiment();
      return (
        <button
          onClick={() =>
            modify(
              {
                children: [
                  { text: "advance[1][0]" },
                  { text: "advance[1][1]" },
                  { text: "advance[1][2]" },
                ],
              },
              [1]
            )
          }
        >
          Add Children
        </button>
      );
    };

    render(
      <Experiment
        persistence={null}
        tasks={{ AdvanceTask, AddChildren }}
        configuration={{
          tasks: ["AddChildren", "AdvanceTask"],
          children: [{ text: "advance[0]" }, {}, { text: "advance[2]" }],
        }}
      />
    );
    await userEvent.click(screen.getByText("Add Children"));
    await userEvent.click(screen.getByText("advance[0]"));
    await userEvent.click(screen.getByText("advance[1][0]"));
    await userEvent.click(screen.getByText("advance[1][1]"));
    await userEvent.click(screen.getByText("advance[1][2]"));
    await userEvent.click(screen.getByText("advance[2]"));
    screen.getByText("You've completed the experiment!");
  });

  it("should pass index as a prop", async () => {
    let Index = (props: any) => {
      return props.__INDEX__?.toString();
    };

    render(
      <Experiment
        persistence={null}
        tasks={{ Index, AdvanceTask }}
        configuration={{
          tasks: ["Index", "AdvanceTask"],
          children: [{ text: "advance" }, { children: [{}] }],
        }}
      />
    );
    screen.getByText("0");
    await userEvent.click(screen.getByText("advance"));
    screen.getByText("1,0");
  });
});

describe("ErrorHandler", () => {
  it("handles errors properly", async () => {
    // NOTE: This test is very flaky because the error stack trace changes every time

    // TODO: this mighta been a bad idea because I removed the modern flag
    jest.useFakeTimers().setSystemTime(new Date("2020-01-01").getTime());

    jest.spyOn(console, "error").mockImplementation(() => {
      //do nothing
    });

    const ErrorTask = () => {
      throw new Error("test error");
    };

    const ErrorHandler: React.FunctionComponent<FallbackProps> = ({
      error,
      resetErrorBoundary,
    }) => {
      const config = useConfiguration();
      const { advance } = useExperiment();

      return (
        <>
          <div>{error.message}</div>
          <div>{error.name}</div>
          <pre>{JSON.stringify(config, null, 2)}</pre>
          <button
            onClick={() => {
              advance();
              resetErrorBoundary();
            }}
          >
            reset
          </button>
        </>
      );
    };

    let elem = render(
      <Experiment
        ErrorHandler={ErrorHandler}
        persistence={null}
        tasks={{ ErrorTask, ButtonTask }}
        configuration={{
          children: [
            { task: "ErrorTask" },
            {
              text: "button",
              task: "ButtonTask",
            },
          ],
        }}
      />
    );
    // https://github.com/testing-library/user-event/issues/833
    let userE = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });

    screen.getByText("test error");
    // expect(elem.asFragment()).toMatchSnapshot();
    await userE.click(screen.getByText("reset"));

    screen.getByText("button");
    jest.restoreAllMocks();
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });
});
