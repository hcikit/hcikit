import {
  flattenToLevel,
  getCurrentProps,
  advanceWorkflow,
  log,
  logAction,
  scopePropsForTask,
  mergeArraysSpecial,
  getCurrentIndex
} from "./Workflow";
import deepFreeze from "deep-freeze";

const configuration = {
  configprop: "section",
  nextLevel: "sections",
  index: 0,
  StimulusResponse: {
    hello: "world",
    yolo: "yoyololo"
  },
  children: [
    {
      nextLevel: "blocks",
      index: 0,
      sectionprop: "section",
      children: [
        {
          blockprop: "section",
          stimulus: "overwritten",
          nextLevel: "trials",
          index: 0,
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
          nextLevel: "trials",
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

describe("advanceWorkflow", () => {
  it("advances experiments", () => {
    expect(getCurrentProps(config).stimulus).toEqual("bear");
    advanceWorkflow(config);

    expect(getCurrentProps(config).stimulus).toEqual("pig");

    advanceWorkflow(config);
    expect(getCurrentProps(config).stimulus).toEqual("bird");

    advanceWorkflow(config);
    expect(getCurrentProps(config).stimulus).toEqual("dog");
  });

  it("ends gracefully", () => {
    advanceWorkflow(config);
    advanceWorkflow(config);
    advanceWorkflow(config);
    advanceWorkflow(config);

    expect(getCurrentProps(config)).toEqual({});
  });

  it("cant advance past end", () => {
    advanceWorkflow(config);
    advanceWorkflow(config);
    advanceWorkflow(config);
    advanceWorkflow(config);
    advanceWorkflow(config);

    expect(getCurrentProps(config)).toEqual({});
    expect(config.children.length).toBe(1);
  });

  it("replaces the required objects", () => {
    let c = { ...config };
    advanceWorkflow(c);

    deepFreeze(config);

    expect(config).not.toBe(c);
    expect(config.children).not.toBe(c.children);
    expect(config.children[1]).toBe(c.children[1]);
    expect(config.children[0]).not.toBe(c.children[0]);
    expect(config.children[0].children).not.toBe(c.children[0].children);
    expect(config.children[0].children[1]).toBe(c.children[0].children[1]);
    expect(config.children[0].children[0]).not.toBe(c.children[0].children[0]);
    expect(config.children[0].children[0].children).not.toBe(
      c.children[0].children[0].children
    );
    expect(config.children[0].children[0].children[1]).toBe(
      c.children[0].children[0].children[1]
    );
    expect(config.children[0].children[0].children[0]).not.toBe(
      c.children[0].children[0].children[0]
    );
  });
});

describe("getCurrentIndex", () => {
  it("returns the index as an array", () => {
    expect(getCurrentIndex(config)).toEqual([0, 0, 0]);
  });
  it("returns the index as an after advancing", () => {
    expect(getCurrentIndex(config)).toEqual([0, 0, 0]);
    advanceWorkflow(config);
    expect(getCurrentIndex(config)).toEqual([0, 0, 1]);
    advanceWorkflow(config);
    expect(getCurrentIndex(config)).toEqual([0, 1, 0]);
    advanceWorkflow(config);
    expect(getCurrentIndex(config)).toEqual([0, 1, 1]);

    advanceWorkflow(config);
    expect(getCurrentIndex(config)).toEqual([]);
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
    advanceWorkflow(config);
    expect(getCurrentProps(config)).toEqual({
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
    advanceWorkflow(config);
    advanceWorkflow(config);
    advanceWorkflow(config);
    advanceWorkflow(config);
    advanceWorkflow(config);

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
    advanceWorkflow(config);
    log(config, "hello", "world", true);
    expect(config.children[0].children[0].children[1].hello.value).toEqual(
      "world"
    );

    advanceWorkflow(config);
    log(config, "hello", "world", true);
    expect(config.children[0].children[1].children[0].hello.value).toEqual(
      "world"
    );

    advanceWorkflow(config);
    log(config, "hello", "world", true);
    expect(config.children[0].children[1].children[1].hello.value).toEqual(
      "world"
    );
  });
  it("log replaces the required objects", () => {
    let c = { ...config };
    log(c, "hello", "world");

    deepFreeze(config);

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
    advanceWorkflow(config);
    logAction(config, "hello");
    expect(
      config.children[0].children[0].children[1].actions[0].action
    ).toEqual("hello");

    advanceWorkflow(config);
    logAction(config, "world");
    expect(
      config.children[0].children[1].children[0].actions[0].action
    ).toEqual("world");

    advanceWorkflow(config);
    logAction(config, "!");
    expect(
      config.children[0].children[1].children[1].actions[0].action
    ).toEqual("!");
  });
});

describe("flattenToLevel", () => {
  it("flattens to one level", () => {
    let flatConfigurations = flattenToLevel(config, "sections");
    expect(flatConfigurations).toHaveLength(1);

    const expected = {
      configprop: "section",
      nextLevel: "blocks",
      index: 0,
      sectionprop: "section",
      StimulusResponse: {
        hello: "world",
        yolo: "yoyololo"
      },

      children: [
        {
          blockprop: "section",
          stimulus: "overwritten",
          nextLevel: "trials",
          index: 0,
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
          nextLevel: "trials",
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
    };
    expect(flatConfigurations[0]).toEqual(expected);
  });

  it("flattens to multiple levels", () => {
    let flatConfigurations = flattenToLevel(config, "blocks");
    expect(flatConfigurations).toHaveLength(2);
    expect(flatConfigurations[0]).toEqual({
      configprop: "section",
      sectionprop: "section",
      blockprop: "section",
      stimulus: "overwritten",
      nextLevel: "trials",
      index: 0,
      StimulusResponse: {
        hello: "world",
        yolo: "yoyololo"
      },

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
    });
  });

  it("handles levels that aren't present", () => {
    let flatConfigurations = flattenToLevel(config, "thisIsNotTheNameOfALevel");
    expect(flatConfigurations).toHaveLength(4);
    expect(flatConfigurations[0]).toEqual({
      configprop: "section",
      sectionprop: "section",
      blockprop: "section",
      stimulus: "bear",
      StimulusResponse: {
        hello: "hello",
        yolo: "yoyololo"
      }
    });
  });
});
