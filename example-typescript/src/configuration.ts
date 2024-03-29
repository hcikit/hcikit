import { ConfigurationReact } from "@hcikit/react";
import { tasks } from "./App";

const configuration: ConfigurationReact<typeof tasks> = {
  tasks: [
    "DevTools",
    "WizardProgress",
    "ResolutionChecker",
    "FocusChecker",
    "DOMEventLogger",
  ],
  ResolutionChecker: {
    minXResolution: 800,
    minYResolution: 400,
    maxYResolution: 2000,
    maxXResolution: 2000,
  },
  // @ts-ignore
  participant: "P1",
  children: [
    {
      task: "InformationScreen",
      label: "Information",
      shortcutEnabled: true,
      centerY: true,
      centerX: true,
      content: `# Hello World
this is *markdown*`,
    },
    {
      label: "Text",
      task: "DisplayText",
      content: "Hello",
    },
    {
      label: "Consent",

      task: "ConsentForm",
      content: `# Consent Form

The consent form uses markdown to create a letter, and it automatically generates as many checkboxes as needed to consent.`,
      questions: [
        {
          label:
            "I consent of my free will to complete this example experiment",
          required: true,
        },
      ],
    },
    {
      label: "Custom",
      task: "CustomTask",
      text: "Click to continue",
    },
    {
      label: "Task",
      task: "IncrementTask",
      children: [
        { desiredValue: 2 },
        { desiredValue: 5 },
        { desiredValue: 10 },
        { desiredValue: 20 },
        { desiredValue: 4 },
        { desiredValue: 1 },
      ],
    },
  ],
};

export default configuration;
