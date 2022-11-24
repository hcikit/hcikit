import React from "react";
import FocusChecker from "./FocusChecker.js";
import { fireEvent, screen } from "@testing-library/react";

import { renderWithProvider } from "../test-utils.js";
import { jest } from "@jest/globals";

describe("FocusChecker", () => {
  it("renders nothing when correct", () => {
    jest.spyOn(document, "hasFocus").mockImplementation(() => true);
    let { container } = renderWithProvider(<FocusChecker />);
    expect(container).toBeEmptyDOMElement();
  });

  it("renders error when unfocused", () => {
    jest.spyOn(document, "hasFocus").mockImplementation(() => false);

    renderWithProvider(<FocusChecker />);
    screen.getByText("You must have the experiment in focus to continue.");
  });

  it("detects problems after event", () => {
    jest.spyOn(document, "hasFocus").mockImplementation(() => true);

    const { container } = renderWithProvider(<FocusChecker />);
    expect(container).toBeEmptyDOMElement();

    fireEvent(window, new Event("blur"));
    screen.getByText("You must have the experiment in focus to continue.");

    fireEvent(window, new Event("focus"));
    expect(container).toBeEmptyDOMElement();
  });

  it("logs properly", () => {
    const log = jest.fn();
    jest.spyOn(document, "hasFocus").mockImplementation(() => true);

    renderWithProvider(<FocusChecker log={log} />);
    expect(log).toHaveBeenLastCalledWith({ type: "focus", focus: true });

    fireEvent(window, new Event("blur"));

    expect(log).toHaveBeenLastCalledWith({ type: "focus", focus: false });

    fireEvent(window, new Event("focus"));

    expect(log).toHaveBeenLastCalledWith({ type: "focus", focus: true });
  });
});
