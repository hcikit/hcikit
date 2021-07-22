import React from "react";
import InformationScreen from "./InformationScreen";
import {
  fireEvent,
  render,
  RenderResult,
  screen,
} from "@testing-library/react";
import { ConfigMutatorContext, ControlFunctions } from "../core/Experiment";
import { ExperimentIndex } from "@hcikit/workflow";

const identities: ControlFunctions = {
  taskComplete: () => {
    // do nothing.
  },
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  setWorkflowIndex: (_index: ExperimentIndex) => {
    // do nothing.
  },
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  log: (_log: unknown) => {
    // do nothing.
  },
  modifyConfigAtDepth: (
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _modifiedConfig: Record<string, unknown>,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _depth?: number | undefined
  ) => {
    // do nothing.
  },
  modifyConfig: (
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _index: ExperimentIndex,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _modifiedConfig: Record<string, unknown>
  ) => {
    // do nothing.
  },
};

export const renderWithProvider = (
  Component: React.ReactElement,
  funcs: Partial<ControlFunctions> = identities
): RenderResult => {
  return render(
    <ConfigMutatorContext.Provider value={{ ...identities, ...funcs }}>
      {Component}
    </ConfigMutatorContext.Provider>
  );
};
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
    const taskComplete = jest.fn();
    renderWithProvider(<InformationScreen content="Hello World" />, {
      taskComplete,
    });

    screen.getByText("Continue").click();
    expect(taskComplete).toBeCalledTimes(1);
  });

  it("doesn't advance when withContinue is false", () => {
    const taskComplete = jest.fn();

    const rendered = renderWithProvider(
      <InformationScreen
        withContinue={false}
        shortcutEnabled
        content="Hello World"
      />,
      { taskComplete }
    );

    fireEvent.keyDown(rendered.baseElement, { key: "Enter", code: "Enter" });

    expect(taskComplete).not.toHaveBeenCalled();
  });

  it("advances with a keyboard press", () => {
    const taskComplete = jest.fn();
    const rendered = renderWithProvider(
      <InformationScreen shortcutEnabled content="Hello World" />,
      { taskComplete }
    );

    fireEvent.keyDown(rendered.baseElement, { key: "Enter", code: "Enter" });
    expect(taskComplete).toBeCalledTimes(1);
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
