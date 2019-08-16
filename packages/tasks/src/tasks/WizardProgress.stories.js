import React from "react";
import { storiesOf } from "@storybook/react";
import { WizardProgress } from "./WizardProgress";

storiesOf("WizardProgress", module)
  .add("start", () => (
    <WizardProgress
      configuration={{
        children: [
          { task: "Hello", children: [{}, {}, {}] },
          { task: "World", children: [{}, {}, {}] },
          { task: "you", children: [{}, {}, {}] }
        ]
      }}
    />
  ))
  .add("middle", () => (
    <WizardProgress
      configuration={{
        __INDEX__: [1, 1],
        children: [
          { task: "Hello", children: [{}, {}, {}] },
          { task: "World", children: [{}, {}, {}] },
          { task: "you", children: [{}, {}, {}] }
        ]
      }}
    />
  ))
  .add("end", () => (
    <WizardProgress
      configuration={{
        __INDEX__: [2, 2],
        children: [
          { task: "Hello", children: [{}, {}, {}] },
          { task: "World", children: [{}, {}, {}] },
          { task: "You", children: [{}, {}, {}] }
        ]
      }}
    />
  ));
