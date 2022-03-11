import React from "react";
import ResolutionChecker from "./ResolutionChecker.js";
import { fireEvent, screen } from "@testing-library/react";

import { renderWithProvider } from "../test-utils.js";

let props = {
  maxXResolution: 1000,
  maxYResolution: 1000,
  minYResolution: 500,
  minXResolution: 500,
};

describe("ResolutionChecker", () => {
  beforeEach(() => {
    Object.assign(window, { innerWidth: 1000, innerHeight: 1000 });
  });

  it("renders nothing when correct", () => {
    let { container } = renderWithProvider(<ResolutionChecker {...props} />);
    expect(container).toBeEmptyDOMElement();
  });

  it("renders error for x too small", () => {
    Object.assign(window, { innerWidth: 499, innerHeight: 1000 });

    renderWithProvider(<ResolutionChecker {...props} />);

    screen.getByText(
      "Your window is too small. The width must be at least 500px."
    );
  });

  it("renders error for x too big", () => {
    Object.assign(window, { innerWidth: 1001, innerHeight: 1000 });
    renderWithProvider(<ResolutionChecker {...props} />);

    screen.getByText(
      "Your window is too big. The width must be smaller than 1000px."
    );
  });

  it("renders error for y too small", () => {
    Object.assign(window, { innerWidth: 1000, innerHeight: 499 });
    renderWithProvider(<ResolutionChecker {...props} />);

    screen.getByText(
      "Your window is too small. The height must be at least 500px."
    );
  });

  it("renders error for y too big", () => {
    Object.assign(window, { innerWidth: 1000, innerHeight: 1001 });
    renderWithProvider(<ResolutionChecker {...props} />);

    screen.getByText(
      "Your window is too big. The height must be smaller than 1000px."
    );
  });

  it("renders multiple errors", () => {
    Object.assign(window, { innerWidth: 1001, innerHeight: 1001 });
    const elem = renderWithProvider(<ResolutionChecker {...props} />);

    screen.getByText(
      "Your window is too big. The height must be smaller than 1000px."
    );
    screen.getByText(
      "Your window is too big. The width must be smaller than 1000px."
    );
    expect(elem.asFragment()).toMatchSnapshot();
  });

  it("detects problems after resize", () => {
    Object.assign(window, { innerWidth: 1000, innerHeight: 1000 });

    const { container } = renderWithProvider(<ResolutionChecker {...props} />);

    expect(container).toBeEmptyDOMElement();

    Object.assign(window, { innerWidth: 1000, innerHeight: 499 });

    fireEvent(window, new Event("resize"));

    screen.getByText(
      "Your window is too small. The height must be at least 500px."
    );
  });

  it("logs properly", () => {
    Object.assign(window, { innerWidth: 1001, innerHeight: 1001 });
    const log = jest.fn();

    renderWithProvider(<ResolutionChecker {...props} log={log} />);

    expect(log).toHaveBeenLastCalledWith({
      type: "resize",
      width: 1001,
      height: 1001,
      failingDimensions: ["maxXResolution", "maxYResolution"],
      valid: false,
    });

    Object.assign(window, { innerWidth: 499, innerHeight: 499 });
    fireEvent(window, new Event("resize"));

    expect(log).toHaveBeenLastCalledWith({
      type: "resize",
      width: 499,
      height: 499,
      failingDimensions: ["minXResolution", "minYResolution"],
      valid: false,
    });

    Object.assign(window, { innerWidth: 499, innerHeight: 501 });
    fireEvent(window, new Event("resize"));

    expect(log).toHaveBeenLastCalledWith({
      type: "resize",
      width: 499,
      height: 501,
      failingDimensions: ["minXResolution"],
      valid: false,
    });

    Object.assign(window, { innerWidth: 501, innerHeight: 501 });
    fireEvent(window, new Event("resize"));

    expect(log).toHaveBeenLastCalledWith({
      type: "resize",
      width: 501,
      height: 501,
      failingDimensions: [],
      valid: true,
    });
  });
});
