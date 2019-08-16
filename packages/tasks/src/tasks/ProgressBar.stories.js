import React from "react";
import { storiesOf } from "@storybook/react";
import { ProgressBar } from "./ProgressBar";

storiesOf("ProgressBar", module)
  .add("start", () => (
    <ProgressBar
      configuration={{
        children: [
          { task: "Hello", children: [{}, {}, {}] },
          { task: "World", children: [{}, {}, {}] }
        ]
      }}
    />
  ))
  .add("middle", () => (
    <ProgressBar
      configuration={{
        __INDEX__: [0, 1],
        children: [
          { task: "Hello", children: [{}, {}, {}] },
          { task: "World", children: [{}, {}, {}] }
        ]
      }}
    />
  ))

  .add("end", () => (
    <ProgressBar
      configuration={{
        __INDEX__: [1, 2],
        children: [
          { task: "Hello", children: [{}, {}, {}] },
          { task: "World", children: [{}, {}, {}] }
        ]
      }}
    />
  ))
  .add("depth start", () => (
    <ProgressBar
      depth={1}
      configuration={{
        __INDEX__: [0, 0],
        children: [
          { task: "Hello", children: [{}, {}, {}] },
          { task: "World", children: [{}, {}, {}] }
        ]
      }}
    />
  ))
  .add("depth middle", () => (
    <ProgressBar
      depth={1}
      configuration={{
        __INDEX__: [0, 1],
        children: [
          { task: "Hello", children: [{}, {}, {}] },
          { task: "World", children: [{}, {}, {}] }
        ]
      }}
    />
  ))
  .add("depth end", () => (
    <ProgressBar
      depth={1}
      configuration={{
        __INDEX__: [0, 2],
        children: [
          { task: "Hello", children: [{}, {}, {}] },
          { task: "World", children: [{}, {}, {}] }
        ]
      }}
    />
  ));
