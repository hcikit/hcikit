import {
  flattenToLevel,
  getCurrentProps,
  log,
  logAction,
  scopePropsForTask,
  mergeArraysSpecial,
  taskComplete,
  getConfigAtIndex,
  __INDEX__
} from "./Workflow";
import deepFreeze from "deep-freeze";

const configuration = {
  configprop: "section",
  StimulusResponse: {
    hello: "world",
    yolo: "yoyololo"
  },
  children: [
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
    expect(getCurrentProps(config)).toEqual({
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
    expect(getCurrentProps(config)).toEqual({
      __INDEX__: [0, 0, 1],
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
    config[__INDEX__] = taskComplete(config);
    config[__INDEX__] = taskComplete(config);
    config[__INDEX__] = taskComplete(config);
    config[__INDEX__] = taskComplete(config);

    deepFreeze(config);

    log(config, "hello", "world");
    expect(config.children.length).toBe(1);
  });

  it("logs to the correct place with timestamp", () => {
    log(config, "hello", "world");
    expect(config.children[0].children[0].children[0].hello).toEqual("world");
  });

  it("logs with timestamp", () => {
    let patch = Date.now;
    Date.now = () => 10;

    log(config, "hello", "world", true);
    expect(config.children[0].children[0].children[0].hello.value).toEqual(
      "world"
    );

    expect(config.children[0].children[0].children[0].hello.timestamp).toEqual(
      10
    );

    Date.now = patch;
  });

  it("logs after advancing correct place", () => {
    config[__INDEX__] = taskComplete(config);

    log(config, "hello", "world", true);
    expect(config.children[0].children[0].children[1].hello.value).toEqual(
      "world"
    );
    config[__INDEX__] = taskComplete(config);

    log(config, "hello", "world", true);
    expect(config.children[0].children[1].children[0].hello.value).toEqual(
      "world"
    );

    config[__INDEX__] = taskComplete(config);
    log(config, "hello", "world", true);
    expect(config.children[0].children[1].children[1].hello.value).toEqual(
      "world"
    );
  });
  it("log replaces the required objects", () => {
    let c = { ...config };
    deepFreeze(config);

    log(c, "hello", "world");

    expect(config).not.toBe(c);
    expect(config.children).not.toBe(c.children);
    expect(config.children[1]).toBe(c.children[1]);
    expect(config.children[0]).not.toBe(c.children[0]);
    expect(config.children[0].children).not.toBe(c.children[0].children);
    expect(config.children[0].children[1]).toBe(c.children[0].children[1]);
    expect(config.children[0].children[0]).not.toBe(c.children[0].children[0]);
    expect(config.children[0].children[0].children).not.toBe(
      c.children[0].children[0].trials
    );
    expect(config.children[0].children[0].children[1]).toBe(
      c.children[0].children[0].children[1]
    );
    expect(config.children[0].children[0].children[0]).not.toBe(
      c.children[0].children[0].children[0]
    );
  });
});

describe("logAction", () => {
  it("logs to the correct place", () => {
    logAction(config, "hello");
    expect(
      config.children[0].children[0].children[0].actions[0].action
    ).toEqual("hello");

    logAction(config, "world");
    expect(
      config.children[0].children[0].children[0].actions[0].action
    ).toEqual("hello");
    expect(
      config.children[0].children[0].children[0].actions[1].action
    ).toEqual("world");
  });

  it("logs after advancing correct place", () => {
    config[__INDEX__] = taskComplete(config);
    logAction(config, "hello");
    expect(
      config.children[0].children[0].children[1].actions[0].action
    ).toEqual("hello");

    config[__INDEX__] = taskComplete(config);
    logAction(config, "world");
    expect(
      config.children[0].children[1].children[0].actions[0].action
    ).toEqual("world");

    config[__INDEX__] = taskComplete(config);
    logAction(config, "!");
    expect(
      config.children[0].children[1].children[1].actions[0].action
    ).toEqual("!");
  });
});

describe("getConfigAtIndex", () => {
  it("empty returns everything", () => {
    expect(getConfigAtIndex([], config)).toEqual(config);
  });

  it("middle levels are returned", () => {
    expect(getConfigAtIndex([0], config)).toEqual({
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
    expect(getConfigAtIndex([0, 0, 0], config)).toEqual({
      stimulus: "bear"
    });
  });
});

describe("taskComplete", () => {
  it("advances experiments", () => {
    expect(taskComplete(config)).toEqual([0, 0, 1]);
  });

  it("advances from second", () => {
    config[__INDEX__] = [0, 0, 1];
    expect(taskComplete(config)).toEqual([0, 1, 0]);
  });

  it("ends gracefully", () => {
    config[__INDEX__] = taskComplete(config);
    expect(config[__INDEX__]).toEqual([0, 0, 1]);
    config[__INDEX__] = taskComplete(config);
    expect(config[__INDEX__]).toEqual([0, 1, 0]);
    config[__INDEX__] = taskComplete(config);
    expect(config[__INDEX__]).toEqual([0, 1, 1]);
    config[__INDEX__] = taskComplete(config);

    expect(getCurrentProps(config)).toEqual({});
    expect(config[__INDEX__]).toEqual([]);
  });

  it("cant advance past end", () => {
    config[__INDEX__] = taskComplete(config);
    config[__INDEX__] = taskComplete(config);
    config[__INDEX__] = taskComplete(config);
    config[__INDEX__] = taskComplete(config);

    expect(getCurrentProps(config)).toEqual({});
    expect(config.children.length).toBe(1);
    expect(config[__INDEX__]).toEqual([]);
  });
});
