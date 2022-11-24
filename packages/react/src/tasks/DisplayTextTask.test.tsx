import React from "react";
import DisplayTextTask from "./DisplayTextTask.js";
import { screen } from "@testing-library/react";
import { renderWithProvider } from "../test-utils.js";
import userEvent from "@testing-library/user-event";
import { jest } from "@jest/globals";

describe("DisplayTextTask", () => {
  it("renders without crashing", () => {
    renderWithProvider(<DisplayTextTask content="hello" />);
  });

  it("advances to the next task", async () => {
    const advance = jest.fn();

    renderWithProvider(<DisplayTextTask content="Hello World" />, {
      advance,
    });

    await userEvent.click(screen.getByText("Continue"));
    expect(advance).toBeCalledTimes(1);
  });

  it("renders properly", () => {
    expect(
      renderWithProvider(<DisplayTextTask content="hello" />).asFragment()
    ).toMatchSnapshot();
  });

  it("renders plain text", () => {
    renderWithProvider(<DisplayTextTask content="hello" />);

    screen.getByText("hello", { selector: "h1" });
  });
});
