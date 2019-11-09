import React from "react";
import { storiesOf } from "@storybook/react";
import DisplayTextTask from "./DisplayTextTask";
import { action } from "@storybook/addon-actions";

storiesOf("DisplayTextTask", module).add("markdown", () => (
  <DisplayTextTask
    content={"This task can show short text."}
    taskComplete={action("taskComplete")}
  />
));
