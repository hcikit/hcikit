import React from "react";
import { storiesOf } from "@storybook/react";
import { action } from "@storybook/addon-actions";
import reducer from "./StimulusResponse.reducers";
import {
  ConnectedStimulusResponse as StimulusResponse,
  TextStimulus,
  ImageStimulus
} from "./StimulusResponse";
import { createStore, combineReducers } from "redux";
import { Provider } from "react-redux";

const store = createStore(combineReducers({ StimulusResponse: reducer }));

storiesOf("tasks/StimulusResponse", module)
  .addDecorator(story => <Provider store={store}>{story()}</Provider>)
  .add("default", () => (
    <StimulusResponse
      stimulus="bear"
      responseInput="Buttons"
      menuItems={["hello", "bear", "fish"]}
      onAdvanceWorkflow={action("advanceWorkflow")}
      onLog={action("onlog")}
    />
  ))
  .add("continueOnError", () => (
    <StimulusResponse
      stimulus="bear"
      responseInput="Buttons"
      menuItems={["hello", "bear", "fish"]}
      onAdvanceWorkflow={action("advanceWorkflow")}
      onLog={action("onlog")}
    />
  ))
  .add("delayOnError", () => (
    <StimulusResponse
      stimulus="bear"
      responseInput="Buttons"
      menuItems={["hello", "bear", "fish"]}
      onAdvanceWorkflow={action("advanceWorkflow")}
      delayOnError={3000}
      onLog={action("onlog")}
    />
  ))
  .add("flashOnError", () => (
    <StimulusResponse
      stimulus="bear"
      responseInput="Buttons"
      menuItems={["hello", "bear", "fish"]}
      onAdvanceWorkflow={action("advanceWorkflow")}
      flashOnError
      delayOnError={1000}
      onLog={action("onlog")}
    />
  ));

storiesOf("tasks/StimulusResponse/Stimulus", module)
  .add("TextStimulus", () => <TextStimulus stimulus="Bear" />)
  .add("ImageStimulus", () => <ImageStimulus stimulus="Bear" src="" />);
