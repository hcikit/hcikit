import React from "react";
import DisplayTextTask from "./DisplayTextTask";
import { screen } from "@testing-library/react";
import { renderWithProvider } from "./InformationScreen.test";

describe("DisplayTextTask", () => {
  it("renders without crashing", () => {
    renderWithProvider(<DisplayTextTask content="hello" />);
  });

  it("advances to the next task", () => {
    const advance = jest.fn();

    renderWithProvider(<DisplayTextTask content="Hello World" />, {
      advance,
    });

    screen.getByText("Continue").click();
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
