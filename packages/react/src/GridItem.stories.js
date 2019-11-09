import React from "react";
import { storiesOf } from "@storybook/react";
import InformationScreen from "./tasks/InformationScreen";
import GridLayout from "./GridLayout";
import { WizardProgress } from "./tasks/WizardProgress";
import { ProgressBar } from "./tasks/ProgressBar";

let config = {
  __INDEX__: [1, 1],
  children: [
    { task: "Hello", children: [{}, {}, {}] },
    { task: "You", children: [{}, {}, {}] },
    { task: "World", children: [{}, {}, {}] }
  ]
};

let content = `# Grid Layout

The screen is split into three sections. 

Components choose where they want to be placed by wrapping themselves in a withGridItem(MyComponent, location) call.`;
storiesOf("GridItem", module)
  .add("header", () => (
    <GridLayout>
      <ProgressBar configuration={config} />
      <InformationScreen content={content} />
      <WizardProgress configuration={config} />
    </GridLayout>
  ))
  .add("swapped", () => (
    <GridLayout>
      <ProgressBar gridArea="header" configuration={config} />
      <InformationScreen content={content} />
      <WizardProgress gridArea="footer" configuration={config} />
    </GridLayout>
  ));
