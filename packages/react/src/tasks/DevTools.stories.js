import React from "react";

import { storiesOf } from "@storybook/react";
import { action } from "@storybook/addon-actions";

import { DevTools } from "./DevTools";

storiesOf("DevTools", module)
  .add("start", () => (
    <DevTools
      taskComplete={action("next task")}
      configuration={{
        children: [
          { task: "Hello", children: [{}, {}, {}] },
          { task: "World", children: [{}, {}, {}] }
        ]
      }}
    />
  ))
  .add("middle", () => (
    <DevTools
      taskComplete={action("next task")}
      configuration={{
        __INDEX__: [1, 0],
        children: [
          { task: "Hello", children: [{}, {}, {}] },
          { task: "World", children: [{}, {}, {}] }
        ]
      }}
    />
  ))
  .add("end", () => (
    <DevTools
      taskComplete={action("next task")}
      configuration={{
        __INDEX__: [1, 2],
        children: [
          { task: "Hello", children: [{}, {}, {}] },
          { task: "World", children: [{}, {}, {}] }
        ]
      }}
    />
  ));
