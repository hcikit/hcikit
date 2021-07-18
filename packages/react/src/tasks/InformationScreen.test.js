import React from "react";
import InformationScreen from "./InformationScreen";
import { render, screen } from "@testing-library/react";

describe("InformationScreen", () => {
  it("renders without crashing", () => {
    render(<InformationScreen content="hello" />);
  });

  it("renders without continue", () => {
    render(<InformationScreen withContinue={false} content="hello" />);
    expect(screen.queryByText("Continue")).not.toBeInTheDocument();
  });

  it("advances to the next task", () => {
    let taskCompleteSpy = jest.fn();
    render(
      <InformationScreen taskComplete={taskCompleteSpy} content="Hello World" />
    );

    screen.getByText("Continue").click();
    expect(taskCompleteSpy).toBeCalledTimes(1);
  });

  it("doesn't advance when with continue is false", () => {
    let taskCompleteSpy = jest.fn();
    const map = {};

    jest.spyOn(window, "addEventListener").mockImplementation((event, cb) => {
      map[event] = cb;
    });

    render(
      <InformationScreen
        withContinue={false}
        taskComplete={taskCompleteSpy}
        shortcutEnabled
        content="Hello World"
      />
    );
    map.keydown({ key: "Enter" });
    expect(taskCompleteSpy).not.toHaveBeenCalled();
  });

  it("advances with a keyboard press", () => {
    const map = {};

    jest.spyOn(window, "addEventListener").mockImplementation((event, cb) => {
      map[event] = cb;
    });

    let taskCompleteSpy = jest.fn();
    render(
      <InformationScreen
        taskComplete={taskCompleteSpy}
        shortcutEnabled
        content="Hello World"
      />
    );

    map.keydown({ key: "Enter" });
    expect(taskCompleteSpy).toBeCalledTimes(1);
  });

  it("renders markdown properly", () => {
    let markdown = `
# Hello World

 - This is some markdown
 - that should render *properly*
`;

    expect(
      render(<InformationScreen content={markdown} />).asFragment()
    ).toMatchSnapshot();
  });
});
