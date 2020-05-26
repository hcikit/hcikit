import React from "react";
import InformationScreen from "./tasks/InformationScreen";
import GridLayout, { withGridItem } from "./GridLayout";
import { WizardProgress } from "./tasks/WizardProgress";
import { ProgressBar } from "./tasks/ProgressBar";
import styled from "styled-components";

let configuration = {
  __INDEX__: [1, 1],
  children: [
    { task: "Hello", children: [{}, {}, {}] },
    { task: "You", children: [{}, {}, {}] },
    { task: "World", children: [{}, {}, {}] },
  ],
};

let Div = styled.div`
  width: 100%;
  height: 100%;
  background-color: ${({ color }) => color};
`;

let H1 = styled.h1`
  vertical-align: middle;
  margin: 0;
`;

let TitledDiv = ({ children, color }) => (
  <Div color={color}>
    <H1>{children}</H1>
  </Div>
);

let Header = withGridItem(
  () => <TitledDiv color={"rgba(0,0,255,0.5)"}>Header</TitledDiv>,
  "header"
);
let Task = withGridItem(
  () => <TitledDiv color={"rgba(255,0,0,0.5)"}>Task</TitledDiv>,
  "task"
);
let Footer = withGridItem(
  () => <TitledDiv color={"rgba(0,255,0,0.5)"}>Footer</TitledDiv>,
  "footer"
);

let content = `# Grid Layout

The screen is split into three sections. 

Components choose where they want to be placed by wrapping themselves in a withGridItem(MyComponent, location) call.`;

export default {
  title: "Grid",
  component: GridLayout,
  decorators: [
    (storyFn) => (
      <div style={{ minHeight: "500px", height: "1px" }}>{storyFn()}</div>
    ),
  ],
};

export const Order = () => (
  <GridLayout>
    <Task />
    <Header />
    <Footer />
  </GridLayout>
);

export const Swapped = () => (
  <GridLayout>
    <Task />
    <Header gridArea={"footer"} />
    <Footer gridArea={"header"} />
  </GridLayout>
);

export const Example = () => (
  <GridLayout>
    <ProgressBar configuration={configuration} />
    <InformationScreen content={content} />
    <WizardProgress configuration={configuration} />
  </GridLayout>
);
