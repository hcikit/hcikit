import React from "react";
import { shallow } from "enzyme";
import DisplayTextTask from "./DisplayTextTask";

it("renders without crashing", () => {
  shallow(<DisplayTextTask content="hello" />);
});
