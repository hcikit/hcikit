import React from "react";
import DisplayTextTask from "./DisplayTextTask";
import { screen, render } from "@testing-library/react";
import { renderWithProvider } from "./InformationScreen.test";

describe("DisplayTextTask", () => {
  it("renders without crashing", () => {
    renderWithProvider(<DisplayTextTask content="hello" />);
  });

  // TODO: this will kind of be ruined.. Unless I mock the provider.
  it("advances to the next task", () => {
    const taskComplete = jest.fn();

    renderWithProvider(<DisplayTextTask content="Hello World" />, {
      taskComplete,
    });

    screen.getByText("Continue").click();
    expect(taskComplete).toBeCalledTimes(1);
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
