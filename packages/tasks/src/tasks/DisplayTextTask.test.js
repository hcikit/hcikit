import React from "react";
import { mount } from "enzyme";
import DisplayTextTask from "./DisplayTextTask";
describe("DisplayTextTask", () => {
  it("renders without crashing", () => {
    mount(<DisplayTextTask content="hello" />);
  });

  it("advances to the next task", () => {
    let taskCompleteSpy = jest.fn();
    let container = mount(
      <DisplayTextTask taskComplete={taskCompleteSpy} content="Hello World" />
    );

    container.find("button").simulate("click");
    expect(taskCompleteSpy).toBeCalledTimes(1);
  });

  // it("renders properly", () => {
  //   expect(mount(<DisplayTextTask content="hello" />)).toMatchSnapshot();
  // });

  it("renders plain text", () => {
    let container = mount(<DisplayTextTask content="hello" />);

    expect(container.find("h1").text()).toBe("hello");
  });
});
