import React from "react";
import { storiesOf } from "@storybook/react";
import InformationScreen from "./InformationScreen";
import { action } from "@storybook/addon-actions";

let text = `
# Hi!
This is a screen with markdown.

- You can create bullets **bold** text or *emphasise* text
`;

storiesOf("InformationScreen", module)
  .add("example", () => (
    <InformationScreen content={text} taskComplete={action("taskComplete")} />
  ))
  .add("short", () => (
    <InformationScreen content={"Hi"} taskComplete={action("taskComplete")} />
  ))

  .add("withoutContinue", () => (
    <InformationScreen
      content={
        "This screen has no continue button. It's great for end of experiment screens."
      }
      withContinue={false}
    />
  ))
  .add("center top", () => (
    <InformationScreen
      content={"The text doesn't have to be centered on the screen"}
      centerX
      centerY={false}
      taskComplete={action("taskComplete")}
    />
  ))
  .add("enter to continue", () => (
    <InformationScreen
      content={"A shortcut can also trigger continue"}
      shortcutEnabled
      taskComplete={action("taskComplete")}
    />
  ));
