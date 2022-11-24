import React from "react";
import { Upload } from "./Upload.js";
import { screen, act } from "@testing-library/react";

import { renderWithProvider } from "../test-utils.js";
import userEvent from "@testing-library/user-event";
import { jest } from "@jest/globals";
import { Configuration } from "@hcikit/workflow";

let userEventOverloaded = userEvent.setup({
  advanceTimers: jest.advanceTimersByTime,
});

let err = console.error;
describe("Upload", () => {
  beforeEach(() => {
    jest.useFakeTimers();

    console.error = jest.fn();
  });

  afterEach(() => {
    jest.useRealTimers();

    console.error = err;
  });

  it("works properly when successful", async () => {
    let outerResolve: Function;
    let lastPromise: Promise<unknown>;

    let uploadFunction = jest.fn().mockImplementation(async () => {
      lastPromise = new Promise((resolve) => {
        outerResolve = resolve;
      });
      return lastPromise;
    }) as (filename: string, config: Configuration) => Promise<any>;

    let advance = jest.fn();

    renderWithProvider(
      <Upload
        experimenter="blaine"
        filename="blaine.json"
        upload={uploadFunction}
      />,
      { advance },
      { task: "myTask", config: "config" }
    );

    expect(uploadFunction).toHaveBeenCalledWith("blaine.json", {
      task: "myTask",
      config: "config",
    });

    screen.getByText("We're uploading your results!");

    await act(async () => {
      //@ts-ignore
      outerResolve();
      await lastPromise;
    });

    expect(advance).toHaveBeenCalledWith();
  });

  it("delays correct time", async () => {
    let outerReject: Function;
    let lastPromise: Promise<unknown>;

    let uploadFunction = jest.fn().mockImplementation(async () => {
      lastPromise = new Promise((_, reject) => {
        outerReject = reject;
      });
      return lastPromise;
    }) as (filename: string, config: Configuration) => Promise<any>;

    let advance = jest.fn();

    renderWithProvider(
      <Upload
        experimenter="blaine"
        filename="blaine.json"
        upload={uploadFunction}
        delay={777}
      />,
      { advance },
      { task: "myTask", config: "config" }
    );

    await act(async () => {
      try {
        //@ts-ignore
        outerReject();
        await lastPromise;
      } catch (e) {}
    });

    await act(async () => {
      jest.advanceTimersByTime(777);
    });

    expect(uploadFunction).toHaveBeenCalledTimes(2);
  });

  it("fires and forgets", () => {
    let outerResolve: Function;

    let uploadFunction = jest.fn().mockImplementation(
      async () =>
        new Promise((resolve) => {
          outerResolve = resolve;
        })
    ) as (filename: string, config: Configuration) => Promise<any>;

    let advance = jest.fn();

    renderWithProvider(
      <Upload
        experimenter="blaine"
        filename="blaine.json"
        fireAndForget
        upload={uploadFunction}
      />,
      { advance },
      { task: "myTask", config: "config" }
    );

    expect(uploadFunction).toHaveBeenCalledWith("blaine.json", {
      task: "myTask",
      config: "config",
    });
    expect(advance).toHaveBeenCalledWith();

    act(() => {
      //@ts-ignore
      outerResolve();
    });
  });

  it("failing on fire and forget doesn't cause an issue", async () => {
    // NOTE: this one never actually failed...
    let outerResolve: Function;
    let outerReject: Function;
    let lastPromise: Promise<unknown>;

    let uploadFunction = jest.fn().mockImplementation(async () => {
      lastPromise = new Promise((resolve, reject) => {
        outerReject = reject;

        outerResolve = resolve;
      });
      return lastPromise;
    }) as (filename: string, config: Configuration) => Promise<any>;

    let advance = jest.fn();

    renderWithProvider(
      <Upload
        experimenter="blaine"
        filename="blaine.json"
        fireAndForget
        upload={uploadFunction}
      />,
      { advance },
      { task: "myTask", config: "config" }
    );

    await act(async () => {
      try {
        //@ts-ignore
        outerReject();
        await lastPromise;
      } catch (e) {}
    });

    await act(async () => {
      jest.runAllTimers();
    });

    await act(async () => {
      //@ts-ignore
      outerResolve();
      await lastPromise;
    });

    // fail(); // this should cause a render outside of the stuff.
  });

  it("retries on failure with delay", async () => {
    let outerReject: Function;
    let outerResolve: Function;
    let lastPromise: Promise<unknown>;

    let uploadFunction = jest.fn().mockImplementation(async () => {
      lastPromise = new Promise((resolve, reject) => {
        outerReject = reject;

        outerResolve = resolve;
      });
      return lastPromise;
    }) as (filename: string, config: Configuration) => Promise<any>;

    let advance = jest.fn();

    renderWithProvider(
      <Upload
        experimenter="blaine"
        filename="blaine.json"
        upload={uploadFunction}
      />,
      { advance },
      { task: "myTask", config: "config" }
    );

    expect(uploadFunction).toHaveBeenNthCalledWith(1, "blaine.json", {
      task: "myTask",
      config: "config",
    });
    screen.getByText("We're uploading your results!");

    await act(async () => {
      try {
        //@ts-ignore
        outerReject();
        await lastPromise;
      } catch (e) {}
    });
    await act(async () => {
      jest.runAllTimers();
    });

    expect(uploadFunction).toHaveBeenNthCalledWith(2, "blaine.json", {
      task: "myTask",
      config: "config",
    });
    screen.getByText("We're uploading your results!");

    await act(async () => {
      try {
        //@ts-ignore
        outerReject();
        await lastPromise;
      } catch (e) {}
    });
    await act(async () => {
      jest.runAllTimers();
    });

    expect(uploadFunction).toHaveBeenNthCalledWith(2, "blaine.json", {
      task: "myTask",
      config: "config",
    });
    screen.getByText("We're uploading your results!");

    await act(async () => {
      //@ts-ignore
      outerResolve();
      await lastPromise;
    });

    expect(advance).toHaveBeenCalledWith();
  });

  it("shows error if too many retries", async () => {
    let outerReject: Function;
    let lastPromise: Promise<unknown>;

    let uploadFunction = jest.fn().mockImplementation(async () => {
      lastPromise = new Promise((_, reject) => {
        outerReject = reject;
      });
      return lastPromise;
    }) as (filename: string, config: Configuration) => Promise<any>;

    let advance = jest.fn();

    renderWithProvider(
      <Upload
        experimenter="blaine"
        filename="blaine.json"
        upload={uploadFunction}
        retries={2}
      />,
      { advance },
      { task: "myTask", config: "config" }
    );

    await act(async () => {
      try {
        //@ts-ignore
        outerReject();
        await lastPromise;
      } catch (e) {}
    });

    await act(async () => {
      jest.runAllTimers();
    });

    await act(async () => {
      try {
        //@ts-ignore
        outerReject();
        await lastPromise;
      } catch (e) {}
    });

    await act(async () => {
      jest.runAllTimers();
    });

    await act(async () => {
      try {
        //@ts-ignore
        outerReject();
        await lastPromise;
      } catch (e) {}
    });

    await act(async () => {
      jest.runAllTimers();
    });

    screen.getByText(
      "Something went wrong uploading your results. We'll still compensate you for your time upon submitting the hit. Please download the results and send them to"
    );

    let json = decodeURIComponent(
      screen
        .getByText("Download experiment log")
        .closest("a")
        ?.href.replace("data:text/json;charset=utf-8,", "") || ""
    );

    let filledConfig = JSON.parse(json);

    expect(filledConfig).toEqual({ task: "myTask", config: "config" });

    await userEventOverloaded.click(screen.getByText("Continue"));

    expect(advance).toHaveBeenCalledWith();
  });

  it("logs properly", async () => {
    const log = jest.fn();
    let outerReject: Function;
    let outerResolve: Function;
    let lastPromise: Promise<unknown>;

    let uploadFunction = jest.fn().mockImplementation(async () => {
      lastPromise = new Promise((resolve, reject) => {
        outerReject = reject;
        outerResolve = resolve;
      });
      return lastPromise;
    }) as (filename: string, config: Configuration) => Promise<any>;

    renderWithProvider(
      <Upload
        experimenter="blaine"
        filename="blaine.json"
        upload={uploadFunction}
        retries={2}
      />,
      { log },
      { task: "myTask", config: "config" }
    );

    await act(async () => {
      try {
        //@ts-ignore
        outerReject("my error");
        await lastPromise;
      } catch (e) {}
    });

    await act(async () => {
      jest.runAllTimers();
    });

    expect(log).toHaveBeenNthCalledWith(1, {
      upload_error: "my error",
      type: "UPLOAD_ERROR",
    });

    await act(async () => {
      try {
        //@ts-ignore
        outerResolve();
        await lastPromise;
      } catch (e) {}
    });

    expect(log).toHaveBeenNthCalledWith(2, {
      type: "UPLOAD_COMPLETE",
    });
  });
});
