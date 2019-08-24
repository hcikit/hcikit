import {
  getLeafIndex,
  getConfigAtIndex,
  getCurrentProps,
  log,
  logAction,
  scopePropsForTask,
  mergeArraysSpecial,
  taskComplete,
  __INDEX__,
  indexToTaskNumber,
  taskNumberToIndex,
  getTotalTasks,
  iterateConfig,
  iterateConfigWithProps
} from "./Workflow";
import deepFreeze from "deep-freeze";

const configuration = {
  configprop: "section",
  StimulusResponse: {
    hello: "world",
    yolo: "yoyololo"
  },
  children: [
    { task: "real task without children" },
    {
      sectionprop: "section",
      children: [
        {
          blockprop: "section",
          stimulus: "overwritten",
          children: [
            {
              stimulus: "bear"
            },
            {
              stimulus: "pig",
              StimulusResponse: {
                hello: "hello"
              }
            }
          ]
        },
        {
          // Note: no index given
          children: [
            {
              stimulus: "bird"
            },
            {
              stimulus: "dog"
            }
          ]
        }
      ]
    }
  ]
};

let config;

beforeEach(() => {
  config = JSON.parse(JSON.stringify(configuration));
});

describe("mergeArraysSpecial", () => {
  it("Overwrites arrays entirely.", () => {
    let merged = mergeArraysSpecial(
      { tasks: ["hello", "world"] },
      { tasks: ["foo", "bar"] }
    );

    expect(merged).toEqual({ tasks: ["foo", "bar"] });
  });
});

describe("scopePropsForTask", () => {
  it("scopes props properly", () => {
    expect(
      scopePropsForTask(
        {
          hello: "world",
          StimulusResponse: {
            you: "too"
          }
        },
        "StimulusResponse"
      )
    ).toEqual({
      hello: "world",
      you: "too"
    });
  });

  it("more specific props override less specific", () => {
    expect(
      scopePropsForTask(
        {
          hello: "world",
          StimulusResponse: {
            hello: "you"
          }
        },
        "StimulusResponse"
      )
    ).toEqual({
      hello: "you"
    });
  });
  it("wrong scopes are thrown away", () => {
    expect(
      scopePropsForTask(
        {
          hello: "world",
          StimulusResponse: {
            hello: "you"
          },
          WrongScope: {
            hello: "dude"
          }
        },
        "StimulusResponse"
      )
    ).toEqual({
      hello: "you"
    });
  });
});

describe("getCurrentProps", () => {
  it("cascades properties from top to bottom", () => {
    config[__INDEX__] = taskComplete(config);

    expect(getCurrentProps(config)).toEqual({
      __INDEX__: [1, 0, 0],
      blockprop: "section",
      sectionprop: "section",
      configprop: "section",
      stimulus: "bear",
      StimulusResponse: {
        hello: "world",
        yolo: "yoyololo"
      }
    });
  });

  it("handles object props properly", () => {
    config[__INDEX__] = taskComplete(config);
    config[__INDEX__] = taskComplete(config);

    expect(getCurrentProps(config)).toEqual({
      __INDEX__: [1, 0, 1],
      blockprop: "section",
      sectionprop: "section",
      configprop: "section",
      stimulus: "pig",
      StimulusResponse: {
        hello: "hello",
        yolo: "yoyololo"
      }
    });
  });

  it("lists get over written", () => {
    let config = {
      tasks: ["hello", "world"],
      children: [{ tasks: ["foo", "bar"] }]
    };
    let props = getCurrentProps(config);

    expect(props.tasks).toEqual(["foo", "bar"]);
  });
});

describe("log", () => {
  it("doesn't log when the experiment is finished", () => {
    let spy = jest.spyOn(console, "error").mockImplementation(() => {});

    config[__INDEX__] = taskComplete(config);
    config[__INDEX__] = taskComplete(config);
    config[__INDEX__] = taskComplete(config);
    config[__INDEX__] = taskComplete(config);
    config[__INDEX__] = taskComplete(config);

    deepFreeze(config);

    log(config, "hello", "world");
    expect(config.children.length).toBe(2);
    expect(spy).toHaveBeenCalledTimes(1);
  });

  it("logs to the correct place with timestamp", () => {
    log(config, "hello", "world");
    expect(config.children[0].hello).toEqual("world");
  });

  it("logs with timestamp", () => {
    let patch = Date.now;
    Date.now = () => 10;

    log(config, "hello", "world", true);
    expect(config.children[0].hello.value).toEqual("world");

    expect(config.children[0].hello.timestamp).toEqual(10);

    Date.now = patch;
  });

  it("logs after advancing correct place", () => {
    config[__INDEX__] = taskComplete(config);

    log(config, "hello", "world", true);
    expect(config.children[1].children[0].children[0].hello.value).toEqual(
      "world"
    );

    config[__INDEX__] = taskComplete(config);

    log(config, "hello", "world", true);
    expect(config.children[1].children[0].children[1].hello.value).toEqual(
      "world"
    );
    config[__INDEX__] = taskComplete(config);

    log(config, "hello", "world", true);
    expect(config.children[1].children[1].children[0].hello.value).toEqual(
      "world"
    );

    config[__INDEX__] = taskComplete(config);
    log(config, "hello", "world", true);
    expect(config.children[1].children[1].children[1].hello.value).toEqual(
      "world"
    );
  });
  it("log replaces the required objects", () => {
    let c = { ...config };
    c[__INDEX__] = taskComplete(c);

    deepFreeze(config);

    log(c, "hello", "world");

    expect(config).not.toBe(c);
    expect(config.children).not.toBe(c.children);
    expect(config.children[1]).not.toBe(c.children[1]);
    expect(config.children[1].children).not.toBe(c.children[1].children);
    expect(config.children[1].children[1]).toBe(c.children[1].children[1]);
    expect(config.children[1].children[0]).not.toBe(c.children[1].children[0]);
    expect(config.children[1].children[0].children).not.toBe(
      c.children[1].children[0].trials
    );
    expect(config.children[1].children[0].children[1]).toBe(
      c.children[1].children[0].children[1]
    );
    expect(config.children[1].children[0].children[0]).not.toBe(
      c.children[1].children[0].children[0]
    );
  });
});

describe("logAction", () => {
  it("logs to the correct place", () => {
    logAction(config, "hello");
    expect(config.children[0].actions[0].action).toEqual("hello");

    logAction(config, "you");
    expect(config.children[0].actions[1].action).toEqual("you");
    logAction(config, "world");
    expect(config.children[0].actions[2].action).toEqual("world");
  });

  it("logs action after advancing correct place", () => {
    config[__INDEX__] = taskComplete(config);
    logAction(config, "hello");
    expect(
      config.children[1].children[0].children[0].actions[0].action
    ).toEqual("hello");

    config[__INDEX__] = taskComplete(config);
    logAction(config, "hello");
    expect(
      config.children[1].children[0].children[1].actions[0].action
    ).toEqual("hello");

    config[__INDEX__] = taskComplete(config);
    logAction(config, "world");
    expect(
      config.children[1].children[1].children[0].actions[0].action
    ).toEqual("world");

    config[__INDEX__] = taskComplete(config);
    logAction(config, "!");
    expect(
      config.children[1].children[1].children[1].actions[0].action
    ).toEqual("!");
  });
});

describe("getConfigAtIndex", () => {
  it("empty returns everything", () => {
    expect(getConfigAtIndex([], config)).toEqual(config);
  });

  it("middle levels are returned", () => {
    expect(getConfigAtIndex([1], config)).toEqual({
      sectionprop: "section",
      children: [
        {
          blockprop: "section",
          stimulus: "overwritten",
          children: [
            {
              stimulus: "bear"
            },
            {
              stimulus: "pig",
              StimulusResponse: {
                hello: "hello"
              }
            }
          ]
        },
        {
          // Note: no index given
          children: [
            {
              stimulus: "bird"
            },
            {
              stimulus: "dog"
            }
          ]
        }
      ]
    });
  });
  it("leaves are returned", () => {
    expect(getConfigAtIndex([1, 0, 0], config)).toEqual({
      stimulus: "bear"
    });
  });
});

describe("taskComplete", () => {
  it("advances experiments", () => {
    expect(taskComplete(config)).toEqual([1, 0, 0]);
  });

  it("advances from second", () => {
    config[__INDEX__] = [1, 0, 0];
    expect(taskComplete(config)).toEqual([1, 0, 1]);
  });

  it("ends gracefully", () => {
    config[__INDEX__] = taskComplete(config);
    expect(config[__INDEX__]).toEqual([1, 0, 0]);
    config[__INDEX__] = taskComplete(config);
    expect(config[__INDEX__]).toEqual([1, 0, 1]);
    config[__INDEX__] = taskComplete(config);
    expect(config[__INDEX__]).toEqual([1, 1, 0]);
    config[__INDEX__] = taskComplete(config);
    expect(config[__INDEX__]).toEqual([1, 1, 1]);
    config[__INDEX__] = taskComplete(config);

    expect(config[__INDEX__]).toEqual("__COMPLETE__");
    expect(getCurrentProps(config)).toEqual({});
  });

  it("cant advance past end", () => {
    config[__INDEX__] = taskComplete(config);
    config[__INDEX__] = taskComplete(config);
    config[__INDEX__] = taskComplete(config);
    config[__INDEX__] = taskComplete(config);
    config[__INDEX__] = taskComplete(config);

    expect(config[__INDEX__]).toEqual("__COMPLETE__");
    expect(getCurrentProps(config)).toEqual({});
  });
});

describe("indexToTaskNumber", () => {
  it("works on first task", () => {
    expect(indexToTaskNumber([0], config)).toEqual(0);
  });
  it("works on last task", () => {
    expect(indexToTaskNumber([1, 1, 1], config)).toEqual(4);
  });
  it("works on middle task", () => {
    expect(indexToTaskNumber([1, 0, 1], config)).toEqual(2);
    expect(indexToTaskNumber([1, 1, 0], config)).toEqual(3);
  });

  it("works on a real config", () => {
    let config = {
      __INDEX__: [0, 1],
      children: [
        { task: "Hello", children: [{}, {}, {}] },
        { task: "World", children: [{}, {}, {}] }
      ]
    };
    expect(indexToTaskNumber([0, 1], config)).toEqual(1);
    expect(indexToTaskNumber([1, 2], config)).toEqual(5);
  });
});

describe("taskNumberToIndex", () => {
  it("works on first task", () => {
    expect(taskNumberToIndex(0, config)).toEqual([0]);
  });
  it("works on last task", () => {
    expect(taskNumberToIndex(4, config)).toEqual([1, 1, 1]);
  });
  it("works on middle task", () => {
    expect(taskNumberToIndex(2, config)).toEqual([1, 0, 1]);
    expect(taskNumberToIndex(3, config)).toEqual([1, 1, 0]);
  });
});

describe("getLeafIndex", () => {
  it("works with root task", () => {
    expect(getLeafIndex([], config)).toEqual([0]);
  });

  it("works with leaf task", () => {
    expect(getLeafIndex([1, 1, 0], config)).toEqual([1, 1, 0]);
    expect(getLeafIndex([0], config)).toEqual([0]);
  });
  it("works on middle task", () => {
    expect(getLeafIndex([1], config)).toEqual([1, 0, 0]);
  });
});

describe("getTotalTasks", () => {
  it("works on first task", () => {
    expect(getTotalTasks(config)).toEqual(5);
  });

  it("really works on a real config", () => {
    let config = {
      __INDEX__: [0, 1],
      children: [
        { task: "Hello", children: [{}, {}, {}] },
        { task: "World", children: [{}, {}, {}] }
      ]
    };
    expect(getTotalTasks(config)).toEqual(6);
  });

  it("works on a real config", () => {
    let config = {
      tasks: ["DevTools"],
      nextLevel: "section",
      fullProgress: true,
      CustomTask: { text: "Click to continue" },
      participant: "yo",
      children: [
        {
          task: "InformationScreen",
          label: "Information",
          shortcutEnabled: true,
          centerY: true,
          centerX: true,
          content: "# Hello World",
          start: 1565928398460
        },
        { label: "Text", task: "DisplayText", content: "Hello" },
        {
          label: "Consent",
          task: "ConsentForm",
          letter:
            "# Consent Form\n\nThe consent form uses markdown to create a letter, and it automatically generates as many checkboxes as needed to consent.",
          questions: [
            {
              label:
                "I consent of my free will to complete this example experiment",
              required: true
            }
          ]
        },
        { label: "Custom", task: "CustomTask" },
        {
          label: "Task",
          progressLevel: true,
          currentProgress: true,
          fullProgress: false,
          task: "IncrementTask",
          children: [
            { desiredValue: 2 },
            { desiredValue: 5 },
            { desiredValue: 10 },
            { desiredValue: 20 },
            { desiredValue: 4 },
            { desiredValue: 1 }
          ]
        }
      ],
      __INDEX__: [0]
    };

    expect(getTotalTasks(config)).toEqual(10);
  });
});

describe("iterateConfig", () => {
  it("iterates with correct indices", () => {
    expect(Array.from(iterateConfig(config))).toEqual([
      [0],
      [1, 0, 0],
      [1, 0, 1],
      [1, 1, 0],
      [1, 1, 1]
    ]);
  });
});

describe("iterateConfigWithProps", () => {
  it("iterates entire config with correct props", () => {
    expect(iterateConfigWithProps(config)).toEqual([
      {
        // __INDEX__: [0],
        configprop: "section",
        task: "real task without children",

        StimulusResponse: {
          hello: "world",
          yolo: "yoyololo"
        }
      },
      {
        // __INDEX__: [1, 0, 0],
        configprop: "section",
        sectionprop: "section",
        blockprop: "section",
        stimulus: "bear",

        StimulusResponse: {
          hello: "world",
          yolo: "yoyololo"
        }
      },
      {
        // __INDEX__: [1, 0, 1],
        configprop: "section",
        blockprop: "section",
        sectionprop: "section",
        stimulus: "pig",

        StimulusResponse: {
          hello: "hello",
          yolo: "yoyololo"
        }
      },
      {
        // __INDEX__: [1, 1, 0],
        configprop: "section",
        sectionprop: "section",

        StimulusResponse: {
          hello: "world",
          yolo: "yoyololo"
        },
        stimulus: "bird"
      },
      {
        // __INDEX__: [1, 1, 1],
        configprop: "section",
        sectionprop: "section",

        StimulusResponse: {
          hello: "world",
          yolo: "yoyololo"
        },
        stimulus: "dog"
      }
    ]);
  });
});
