import {
  getLeafIndex,
  getConfigurationAtIndex,
  getCurrentProps,
  logToConfiguration,
  scopePropsForTask,
  mergeArraysSpecial,
  __INDEX__,
  indexToTaskNumber,
  taskNumberToIndex,
  getTotalTasks,
  iterateConfiguration,
  modifyConfiguration,
  Configuration,
  flattenConfigurationWithProps,
  advanceConfiguration,
  getCurrentIndex,
} from "./index.js";

import deepFreeze from "deep-freeze";
import { jest } from "@jest/globals";

type ConfigType = {
  "real task without children": {
    stimulus: string;
    configprop: string;
    blockprop: string;
    inheritance: string;
    sectionprop: string;
  };
  StimulusResponse: { hello: string; yolo: string; you: string };
  hello: {};
  world: {};
  foo: {};
  bar: {};
};

const configuration: Configuration<ConfigType> = {
  configprop: "section",
  StimulusResponse: {
    hello: "world",
    yolo: "yoyololo",
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
              stimulus: "bear",
            },
            {
              stimulus: "pig",
              StimulusResponse: {
                hello: "hello",
              },
            },
          ],
        },
        {
          // Note: no index given
          children: [
            {
              stimulus: "bird",
            },
            {
              stimulus: "dog",
            },
          ],
        },
      ],
    },
  ],
};

let config: Configuration;

beforeEach(() => {
  config = deepFreeze(JSON.parse(JSON.stringify(configuration)));
});

afterEach(() => {
  jest.clearAllMocks();
});

describe("mergeArraysSpecial", () => {
  it("Overwrites arrays entirely.", () => {
    const merged = mergeArraysSpecial(
      { tasks: ["hello", "world"] },
      { tasks: ["foo", "bar"] }
    );

    expect(merged).toEqual({ tasks: ["foo", "bar"] });
  });
});

describe("scopePropsForTask", () => {
  it("scopes props", () => {
    expect(
      scopePropsForTask(
        {
          hello: "world",
          StimulusResponse: {
            you: "too",
          },
        } as Configuration<ConfigType>,
        "StimulusResponse"
      )
    ).toEqual({
      hello: "world",
      you: "too",
    });
  });

  it("more specific props override less specific", () => {
    expect(
      scopePropsForTask(
        {
          hello: "world",
          StimulusResponse: {
            hello: "you",
          },
        },
        "StimulusResponse"
      )
    ).toEqual({
      hello: "you",
    });
  });
  it("wrong scopes are thrown away", () => {
    expect(
      scopePropsForTask(
        {
          hello: "world",
          StimulusResponse: {
            hello: "you",
          },
          WrongScope: {
            hello: "dude",
          },
        } as Configuration<ConfigType>,
        "StimulusResponse"
      )
    ).toEqual({
      hello: "you",
    });
  });
});

describe("getCurrentProps", () => {
  it("log isn't passed with props", () => {
    config = advanceConfiguration(config);

    config = logToConfiguration(config, { type: "world" });

    expect(getCurrentProps(config)).not.toHaveProperty("logs");

    expect(getCurrentProps(config)).toEqual({
      __INDEX__: [1, 0, 0],
      blockprop: "section",
      sectionprop: "section",
      configprop: "section",
      stimulus: "bear",
      StimulusResponse: {
        hello: "world",
        yolo: "yoyololo",
      },
    });
  });

  it("cascades properties from top to bottom", () => {
    config = JSON.parse(JSON.stringify(configuration));
    config = advanceConfiguration(config);
    config.inheritance = "top";

    if (config?.children?.[1]?.children?.[0]?.children?.[0]) {
      config.children[1].children[0].children[0].inheritance = "bottom";
    } else {
      throw new Error();
    }

    expect(getCurrentProps(config)).toEqual({
      __INDEX__: [1, 0, 0],
      blockprop: "section",
      sectionprop: "section",
      configprop: "section",
      stimulus: "bear",
      inheritance: "bottom",
      StimulusResponse: {
        hello: "world",
        yolo: "yoyololo",
      },
    });
  });

  it("handles object props", () => {
    config = advanceConfiguration(config);
    config = advanceConfiguration(config);

    expect(getCurrentProps(config)).toEqual({
      __INDEX__: [1, 0, 1],
      blockprop: "section",
      sectionprop: "section",
      configprop: "section",
      stimulus: "pig",
      StimulusResponse: {
        hello: "hello",
        yolo: "yoyololo",
      },
    });
  });

  it("lists get over written", () => {
    const config: Configuration<ConfigType> = {
      tasks: ["hello", "world"],
      children: [{ tasks: ["foo", "bar"] }],
    };
    const props = getCurrentProps(config);

    expect(props.tasks).toEqual(["foo", "bar"]);
  });
});

describe("log", () => {
  it("doesn't log when the experiment is finished", () => {
    // eslint-disable-next-line @typescript-eslint/no-empty-function

    config = advanceConfiguration(config);
    config = advanceConfiguration(config);
    config = advanceConfiguration(config);
    config = advanceConfiguration(config);
    config = advanceConfiguration(config);

    deepFreeze(config);

    expect(() => {
      config = logToConfiguration(config, { type: "world" });
    }).toThrow();

    expect(config?.children?.length).toBe(2);
    expect(config.children).not.toHaveProperty("logs");
  });

  it("logs strings properly", () => {
    const patch = Date.now;
    Date.now = () => 10;

    config = logToConfiguration(config, { type: "test", value: "hello world" });
    expect(config?.children?.[0]?.logs?.[0]).toEqual({
      type: "test",
      value: "hello world",
      timestamp: 10,
    });

    Date.now = patch;
  });

  it("logs numbers properly", () => {
    const patch = Date.now;
    Date.now = () => 10;

    config = logToConfiguration(config, { value: 10, type: "number" });
    expect(config?.children?.[0]?.logs?.[0]).toEqual({
      value: 10,
      timestamp: 10,
      type: "number",
    });

    Date.now = patch;
  });

  it("logs correctly with timestamp", () => {
    const patch = Date.now;
    Date.now = () => 10;

    config = logToConfiguration(config, { value: "world", type: "test" });
    expect(config?.children?.[0]?.logs?.[0]).toEqual({
      value: "world",
      type: "test",
      timestamp: 10,
    });

    Date.now = patch;
  });

  it("logs after advancing correct place", () => {
    const patch = Date.now;
    let i = 10;
    Date.now = () => i++;

    config = advanceConfiguration(config);

    config = logToConfiguration(config, { type: "test", value: "world" });
    expect(
      config?.children?.[1]?.children?.[0]?.children?.[0]?.logs?.[0]
    ).toEqual({
      type: "test",
      value: "world",
      timestamp: 10,
    });

    config = advanceConfiguration(config);

    config = logToConfiguration(config, { value: "world", type: "test" });
    expect(config?.children?.[1].children?.[0].children?.[1].logs?.[0]).toEqual(
      {
        value: "world",
        type: "test",
        timestamp: 11,
      }
    );
    config = advanceConfiguration(config);

    config = logToConfiguration(config, { value: "world", type: "test" });
    expect(config.children?.[1].children?.[1].children?.[0].logs?.[0]).toEqual({
      value: "world",
      type: "test",
      timestamp: 12,
    });

    config = advanceConfiguration(config);
    config = logToConfiguration(config, { value: "world", type: "test" });
    expect(config.children?.[1].children?.[1].children?.[1].logs?.[0]).toEqual({
      value: "world",
      type: "test",
      timestamp: 13,
    });
    Date.now = patch;
  });

  it("log replaces the required objects", () => {
    config = advanceConfiguration(config);

    const c = logToConfiguration(config, { value: "world", type: "test" });

    expect(config).not.toBe(c);
    expect(config.children).not.toBe(c.children);
    expect(config.children?.[1]).not.toBe(c.children?.[1]);
    expect(config.children?.[1].children).not.toBe(c.children?.[1].children);
    expect(config.children?.[1].children?.[1]).toBe(
      c.children?.[1].children?.[1]
    );
    expect(config.children?.[1].children?.[0]).not.toBe(
      c.children?.[1].children?.[0]
    );
    expect(config.children?.[1].children?.[0].children).not.toBe(
      c.children?.[1].children?.[0].trials
    );
    expect(config.children?.[1].children?.[0].children?.[1]).toBe(
      c.children?.[1].children?.[0].children?.[1]
    );
    expect(config.children?.[1].children?.[0].children?.[0]).not.toBe(
      c.children?.[1].children?.[0].children?.[0]
    );
  });
});

describe("getConfigAtIndex", () => {
  it("empty returns nothing", () => {
    expect(getConfigurationAtIndex(config, [])).toEqual(config);
  });

  it("middle levels are returned", () => {
    expect(getConfigurationAtIndex(config, [1])).toEqual({
      sectionprop: "section",
      children: [
        {
          blockprop: "section",
          stimulus: "overwritten",
          children: [
            {
              stimulus: "bear",
            },
            {
              stimulus: "pig",
              StimulusResponse: {
                hello: "hello",
              },
            },
          ],
        },
        {
          // Note: no index given
          children: [
            {
              stimulus: "bird",
            },
            {
              stimulus: "dog",
            },
          ],
        },
      ],
    });
  });
  it("leaves are returned", () => {
    expect(getConfigurationAtIndex(config, [1, 0, 0])).toEqual({
      stimulus: "bear",
    });
  });
});

describe("advanceConfiguration", () => {
  it("advances experiments", () => {
    expect(getCurrentIndex(advanceConfiguration(config))).toEqual([1, 0, 0]);
  });

  it("advances from second", () => {
    config = advanceConfiguration(config, [1, 0, 0]);
    expect(getCurrentIndex(advanceConfiguration(config))).toEqual([1, 0, 1]);
  });

  it("ends gracefully", () => {
    config = advanceConfiguration(config);
    expect(config[__INDEX__]).toEqual([1, 0, 0]);
    config = advanceConfiguration(config);
    expect(config[__INDEX__]).toEqual([1, 0, 1]);
    config = advanceConfiguration(config);
    expect(config[__INDEX__]).toEqual([1, 1, 0]);
    config = advanceConfiguration(config);
    expect(config[__INDEX__]).toEqual([1, 1, 1]);
    config = advanceConfiguration(config);

    expect(config[__INDEX__]).toEqual([]);
    expect(getCurrentProps(config)).toEqual({});
  });

  it("cant advance past end", () => {
    config = advanceConfiguration(config);
    config = advanceConfiguration(config);
    config = advanceConfiguration(config);
    config = advanceConfiguration(config);
    config = advanceConfiguration(config);

    expect(config[__INDEX__]).toEqual([]);
    expect(getCurrentProps(config)).toEqual({});
  });
});

describe("indexToTaskNumber", () => {
  it("works on first task", () => {
    expect(indexToTaskNumber(config, [0])).toEqual(0);
  });
  it("works on last task", () => {
    expect(indexToTaskNumber(config, [1, 1, 1])).toEqual(4);
  });
  it("works on middle task", () => {
    expect(indexToTaskNumber(config, [1, 0, 1])).toEqual(2);
    expect(indexToTaskNumber(config, [1, 1, 0])).toEqual(3);
  });

  it("works on a real config", () => {
    const config = {
      __INDEX__: [0, 1],
      children: [
        { task: "Hello", children: [{}, {}, {}] },
        { task: "World", children: [{}, {}, {}] },
      ],
    };
    expect(indexToTaskNumber(config, [0, 1])).toEqual(1);
    expect(indexToTaskNumber(config, [1, 2])).toEqual(5);
  });
});

describe("taskNumberToIndex", () => {
  it("works on first task", () => {
    expect(taskNumberToIndex(config, 0)).toEqual([0]);
  });
  it("works on last task", () => {
    expect(taskNumberToIndex(config, 4)).toEqual([1, 1, 1]);
  });
  it("works on middle task", () => {
    expect(taskNumberToIndex(config, 2)).toEqual([1, 0, 1]);
    expect(taskNumberToIndex(config, 3)).toEqual([1, 1, 0]);
  });
});

describe("getLeafIndex", () => {
  it("works with root task", () => {
    expect(getLeafIndex(config, [])).toEqual([]);
  });

  it("works with leaf task", () => {
    expect(getLeafIndex(config, [1, 1, 0])).toEqual([1, 1, 0]);
    expect(getLeafIndex(config, [0])).toEqual([0]);
  });
  it("works on middle task", () => {
    expect(getLeafIndex(config, [1])).toEqual([1, 0, 0]);
  });

  it("works on single level config", () => {
    expect(getLeafIndex({}, [])).toEqual([]);
  });
});

describe("getTotalTasks", () => {
  it("works on first task", () => {
    expect(getTotalTasks(config)).toEqual(5);
  });

  it("really works on a real config", () => {
    const config = {
      __INDEX__: [0, 1],
      children: [
        { task: "Hello", children: [{}, {}, {}] },
        { task: "World", children: [{}, {}, {}] },
      ],
    };
    expect(getTotalTasks(config)).toEqual(6);
  });

  it("works on a real config", () => {
    const config: Configuration = {
      tasks: ["DevTools"],
      nextLevel: "section",
      fullProgress: true,
      CustomTask: { text: "Click to continue" },
      participant: "P1",
      children: [
        {
          task: "InformationScreen",
          label: "Information",
          shortcutEnabled: true,
          centerY: true,
          centerX: true,
          content: "# Hello World",
          start: 1565928398460,
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
              required: true,
            },
          ],
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
            { desiredValue: 1 },
          ],
        },
      ],
      __INDEX__: [0],
    };

    expect(getTotalTasks(config)).toEqual(10);
  });
});

describe("iterateConfig", () => {
  it("iterates with correct indices", () => {
    expect(Array.from(iterateConfiguration(config))).toEqual([
      [0],
      [1, 0, 0],
      [1, 0, 1],
      [1, 1, 0],
      [1, 1, 1],
    ]);
  });
});

describe("flattenConfigurationWithProps", () => {
  it("iterates entire config with correct props", () => {
    expect(flattenConfigurationWithProps(config)).toEqual([
      {
        // __INDEX__: [0],
        configprop: "section",
        task: "real task without children",

        StimulusResponse: {
          hello: "world",
          yolo: "yoyololo",
        },
      },
      {
        // __INDEX__: [1, 0, 0],
        configprop: "section",
        sectionprop: "section",
        blockprop: "section",
        stimulus: "bear",

        StimulusResponse: {
          hello: "world",
          yolo: "yoyololo",
        },
      },
      {
        // __INDEX__: [1, 0, 1],
        configprop: "section",
        blockprop: "section",
        sectionprop: "section",
        stimulus: "pig",

        StimulusResponse: {
          hello: "hello",
          yolo: "yoyololo",
        },
      },
      {
        // __INDEX__: [1, 1, 0],
        configprop: "section",
        sectionprop: "section",

        StimulusResponse: {
          hello: "world",
          yolo: "yoyololo",
        },
        stimulus: "bird",
      },
      {
        // __INDEX__: [1, 1, 1],
        configprop: "section",
        sectionprop: "section",

        StimulusResponse: {
          hello: "world",
          yolo: "yoyololo",
        },
        stimulus: "dog",
      },
    ]);
  });
});

describe("modifyConfiguration", () => {
  it("overwrites existing properties", () => {
    config = modifyConfiguration(config, { configprop: "section" }, []);
    expect(config.configprop).toEqual("section");
  });
  it("works in place", () => {
    config = advanceConfiguration(config);

    deepFreeze(config);

    const c = modifyConfiguration(config, { hello: "world" }, [1, 0, 0]);

    expect(config).not.toBe(c);
    expect(config?.children).not.toBe(c.children);
    expect(config?.children?.[1]).not.toBe(c.children?.[1]);
    expect(config?.children?.[1].children).not.toBe(c.children?.[1].children);
    expect(config?.children?.[1].children?.[1]).toBe(
      c.children?.[1].children?.[1]
    );
    expect(config?.children?.[1].children?.[0]).not.toBe(
      c.children?.[1].children?.[0]
    );
    expect(config?.children?.[1].children?.[0].children).not.toBe(
      c.children?.[1].children?.[0].trials
    );
    expect(config.children?.[1].children?.[0].children?.[1]).toBe(
      c.children?.[1].children?.[0].children?.[1]
    );
    expect(config.children?.[1].children?.[0].children?.[0]).not.toBe(
      c.children?.[1].children?.[0].children?.[0]
    );
  });

  it("modifies top level", () => {
    config = modifyConfiguration(config, { hello: "world" }, []);
    expect(config.hello).toEqual("world");
  });

  it("can add children", () => {
    config = modifyConfiguration(
      config,
      { children: [{ task: "Test" }] },
      [1, 0, 0]
    );
    expect(
      config.children?.[1].children?.[0].children?.[0].children?.[0].task
    ).toEqual("Test");
  });

  it("modifies leaf", () => {
    config = modifyConfiguration(config, { hello: "world" }, [1, 0, 0]);
    expect(config.children?.[1].children?.[0].children?.[0].hello).toEqual(
      "world"
    );
  });
  it("modifies inner", () => {
    config = modifyConfiguration(config, { hello: "world" }, [1, 0]);
    expect(config.children?.[1].children?.[0].hello).toEqual("world");
  });

  it("logs the modification", () => {
    const patch = Date.now;
    Date.now = () => 10;

    config = modifyConfiguration(
      config,
      { hello: "world", stimulus: "hi" },
      [1, 0]
    );

    expect(config.children?.[0].logs?.[0]).toEqual({
      type: "MODIFY_CONFIGURATION",
      to: { hello: "world", stimulus: "hi" },
      from: { hello: undefined, stimulus: "overwritten" },
      index: [1, 0],
      timestamp: 10,
    });

    Date.now = patch;
  });

  it("works", () => {
    config = advanceConfiguration(config);

    const c = modifyConfiguration(config, { hello: "world" }, [1, 0]);

    expect(c.children?.[1].children?.[0].hello).toEqual("world");
  });

  it("index", () => {
    config = advanceConfiguration(config);

    config = modifyConfiguration(config, { hello: "world" }, [1, 0]);
    expect(config.children?.[1].children?.[0].hello).toEqual("world");
  });

  it("edits positive indices", () => {
    config = advanceConfiguration(config);

    config = modifyConfiguration(config, { hello: "world" }, [1]);
    expect(config.children?.[1].hello).toEqual("world");
  });

  it("edits global", () => {
    config = advanceConfiguration(config);

    config = modifyConfiguration(config, { hello: "world" }, []);
    expect(config.hello).toEqual("world");
  });

  it("edits the current level", () => {
    config = advanceConfiguration(config);

    config = modifyConfiguration(config, { hello: "world" }, [1, 0, 0]);
    expect(config.children?.[1].children?.[0].children?.[0].hello).toEqual(
      "world"
    );
  });

  it("works correctly on unstarted experiment?", () => {
    config = modifyConfiguration(config, { hello: "world" }, [0]);
    expect(config.children?.[0].hello).toEqual("world");
  });
});
