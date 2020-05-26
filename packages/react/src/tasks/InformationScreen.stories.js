import React from "react";
import InformationScreen from "./InformationScreen";
import { action } from "@storybook/addon-actions";

let text = `
# Hi!
This is a screen with markdown.

- You can create bullets **bold** text or *emphasise* text
`;

export default {
  title: "InformationScreen",
  component: InformationScreen,
  decorators: [
    (storyFn) => (
      <div style={{ minHeight: "500px", height: "1px" }}>{storyFn()}</div>
    ),
  ],
};

export const Example = () => (
  <InformationScreen content={text} taskComplete={action("taskComplete")} />
);

export const Short = () => (
  <InformationScreen content={"Hi"} taskComplete={action("taskComplete")} />
);

export const WithoutContinue = () => (
  <InformationScreen
    content={
      "This screen has no continue button. It's great for end of experiment screens."
    }
    withContinue={false}
  />
);

export const CenterTop = () => (
  <InformationScreen
    content={"The text doesn't have to be centered on the screen"}
    centerX
    centerY={false}
    taskComplete={action("taskComplete")}
  />
);

export const EnterToContinue = () => (
  <InformationScreen
    content={"A shortcut can also trigger continue"}
    shortcutEnabled
    taskComplete={action("taskComplete")}
  />
);
