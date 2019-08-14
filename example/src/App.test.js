import React from "react";
import { shallow } from "enzyme";
import App from "./App";

it("renders without crashing", () => {
  shallow(<App />);
});

// TODO: the above is a good smoke test, but ideally we would also do more like making sure we can do an end to end run of an experiment and get the expected logs out...
