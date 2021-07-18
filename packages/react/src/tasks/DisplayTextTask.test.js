import React from "react";
import DisplayTextTask from "./DisplayTextTask";
import { screen, render } from "@testing-library/react";

describe("DisplayTextTask", () => {
  it("renders without crashing", () => {
    render(<DisplayTextTask content="hello" />);
  });

  // TODO: this will kind of be ruined.. Unless I mock the provider.
  it("advances to the next task", () => {
    let taskCompleteSpy = jest.fn();

    render(
      <DisplayTextTask taskComplete={taskCompleteSpy} content="Hello World" />
    );

    screen.getByText("Continue").click();
    expect(taskCompleteSpy).toBeCalledTimes(1);
  });

  it("renders properly", () => {
    expect(
      render(<DisplayTextTask content="hello" />).asFragment()
    ).toMatchSnapshot();
  });

  it("renders plain text", () => {
    render(<DisplayTextTask content="hello" />);

    screen.getByText("hello", { selector: "h1" });
  });
});
