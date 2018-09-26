import React from "react";
import { storiesOf } from "@storybook/react";
import { action } from "@storybook/addon-actions";
import { withKnobs, text } from "@storybook/addon-knobs";

import DisplayTextTask from "./DisplayTextTask";

import ExiiConsentLetter from "../data/ExiiConsentLetter.md";

import { UploadToS3Display } from "./UploadToS3";
import {
  KeyMapPointerTutorial,
  KeyMapGuidedTutorial,
  KeyMapShortcutTutorial
} from "./KeyMapTutorial";

import GoogleFormQuestionnaire from "./GoogleFormQuestionnaire";
import MouseCenteringTask from "./MouseCenteringTask";
import ConsentForm from "./ConsentForm";
import {
  ExposeHKPointerTutorial,
  ExposeHKGuidedTutorial,
  ExposeHKShortcutTutorial
} from "./ExposeHKTutorial";

storiesOf("tasks/MouseCenteringTask", module).add("task", () => (
  <MouseCenteringTask onAdvanceWorkflow={action("advanceWorkflow")} />
));

storiesOf("tasks/GoogleFormQuestionnaire", module)
  .add("form", () => (
    <GoogleFormQuestionnaire
      formId="1FAIpQLScYw8Rd-j9YPeVN2fAuqQa_TpdF2a0h9fn_6wA7A3prHoGIwQ"
      answer="ABC12345"
      onAdvanceWorkflow={action("onAdvanceWorkflow")}
    />
  ))
  .add("prefilled", () => (
    <GoogleFormQuestionnaire
      formId="1FAIpQLScYw8Rd-j9YPeVN2fAuqQa_TpdF2a0h9fn_6wA7A3prHoGIwQ"
      prefillParticipant="entry.812855120"
      participant="test"
      answer="ABC12345"
      onAdvanceWorkflow={action("onAdvanceWorkflow")}
    />
  ))
  .add("preview", () => (
    <GoogleFormQuestionnaire
      formId="1FAIpQLSdjqE29uBllkl7SlY-oWIcI5huop9irdAuCHqFOd8YHrGuGDw/"
      answer="ABC12345"
      onAdvanceWorkflow={action("onAdvanceWorkflow")}
    />
  ));

storiesOf("tasks/DisplayTextTask", module)
  .addDecorator(withKnobs)
  .add("Example", () => (
    <DisplayTextTask
      displayedText={text("Text", "Example Message")}
      onAdvanceWorkflow={action("advanceWorkflow")}
    />
  ));

storiesOf("tasks/ConsentForm", module).add("form", () => (
  <ConsentForm
    letter={ExiiConsentLetter}
    questions={[
      {
        label: "I agree of my own free will to participate in the study.",
        required: true
      }
    ]}
    onAdvanceWorkflow={action("onAdvanceWorkflow")}
  />
));

storiesOf("tasks/UploadToS3", module)
  .add("error", () => (
    <UploadToS3Display
      experimenter="experimenter@example.com"
      participant="blaine"
      error
      log={JSON.stringify({ hello: "world" })}
      onClick={action("onAdvanceWorkflow")}
    />
  ))
  .add("uploading", () => (
    <UploadToS3Display onAdvanceWorkflow={action("onAdvanceWorkflow")} />
  ));

storiesOf("tasks/Tutorial", module)
  .add("KeyMap Pointer", () => (
    <KeyMapPointerTutorial onAdvanceWorkflow={action("onAdvanceWorkflow")} />
  ))
  .add("KeyMap Guided", () => (
    <KeyMapGuidedTutorial onAdvanceWorkflow={action("onAdvanceWorkflow")} />
  ))
  .add("KeyMap Shortcut", () => (
    <KeyMapShortcutTutorial onAdvanceWorkflow={action("onAdvanceWorkflow")} />
  ))
  .add("ExposeHK Pointer", () => (
    <ExposeHKPointerTutorial onAdvanceWorkflow={action("onAdvanceWorkflow")} />
  ))
  .add("ExposeHK Guided", () => (
    <ExposeHKGuidedTutorial onAdvanceWorkflow={action("onAdvanceWorkflow")} />
  ))
  .add("ExposeHK Shortcut", () => (
    <ExposeHKShortcutTutorial onAdvanceWorkflow={action("onAdvanceWorkflow")} />
  ));
