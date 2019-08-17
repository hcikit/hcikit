import React from "react";
import { mount } from "enzyme";
import InformationScreen from "./InformationScreen";
import { create, act } from "react-test-renderer";

describe("InformationScreen", () => {
  it("renders without crashing", () => {
    mount(<InformationScreen content="hello" />);
  });

  it("renders without continue", () => {
    let wrapper = mount(
      <InformationScreen withContinue={false} content="hello" />
    );
    expect(wrapper.find("button").exists()).toBeFalsy();
  });

  it("advances to the next task", () => {
    let taskCompleteSpy = jest.fn();
    let container = mount(
      <InformationScreen taskComplete={taskCompleteSpy} content="Hello World" />
    );

    container.find("button").simulate("click");
    expect(taskCompleteSpy).toBeCalledTimes(1);
  });

  it("doesn't advance when with continue is false", () => {
    let taskCompleteSpy = jest.fn();
    const map = {};

    jest.spyOn(window, "addEventListener").mockImplementation((event, cb) => {
      map[event] = cb;
    });

    mount(
      <InformationScreen
        withContinue={false}
        taskComplete={taskCompleteSpy}
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
    mount(
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

    let root;

    act(() => {
      root = create(<InformationScreen content={markdown} />);
    });

    expect(root.toJSON()).toMatchSnapshot();
  });
});
