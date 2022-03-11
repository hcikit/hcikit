import React from "react";
import InformationScreen from "./InformationScreen.js";
import { fireEvent, screen } from "@testing-library/react";

import { renderWithProvider } from "../test-utils.js";

describe("InformationScreen", () => {
  it("renders without crashing", () => {
    renderWithProvider(<InformationScreen content="hello" />);
  });

  it("renders without continue", () => {
    renderWithProvider(
      <InformationScreen withContinue={false} content="hello" />
    );
    expect(screen.queryByText("Continue")).not.toBeInTheDocument();
  });

  it("advances to the next task", () => {
    const advance = jest.fn();
    renderWithProvider(<InformationScreen content="Hello World" />, {
      advance,
    });

    screen.getByText("Continue").click();
    expect(advance).toBeCalledTimes(1);
  });

  it("doesn't advance when withContinue is false", () => {
    const advance = jest.fn();

    const rendered = renderWithProvider(
      <InformationScreen
        withContinue={false}
        shortcutEnabled
        content="Hello World"
      />,
      { advance }
    );

    fireEvent.keyDown(rendered.baseElement, { key: "Enter", code: "Enter" });

    expect(advance).not.toHaveBeenCalled();
  });

  it("advances with a keyboard press", () => {
    const advance = jest.fn();
    const rendered = renderWithProvider(
      <InformationScreen shortcutEnabled content="Hello World" />,
      { advance: advance }
    );

    fireEvent.keyDown(rendered.baseElement, { key: "Enter", code: "Enter" });
    expect(advance).toBeCalledTimes(1);
  });

  it("renders markdown properly", () => {
    const markdown = `
# Hello World

 - This is some markdown
 - that should render *properly*
`;

    expect(
      renderWithProvider(<InformationScreen content={markdown} />).asFragment()
    ).toMatchSnapshot();
  });
});
