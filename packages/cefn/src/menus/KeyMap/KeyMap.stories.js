import React from "react";

import { storiesOf } from "@storybook/react";
import { withKnobs, number } from "@storybook/addon-knobs";
import { action } from "@storybook/addon-actions";

import KeyMap, { Key } from "./KeyMap";
import { all_hierarchies } from "../Shortcuts/CommandHierarchies";
import configureStore from "../../configureStore";
import { Provider } from "react-redux";

const store = configureStore({});

storiesOf("menus/KeyMap", module)
  .addDecorator(story => <Provider store={store}>{story()}</Provider>)
  .addDecorator(withKnobs)
  .add("knob", () => (
    <KeyMap
      onResponse={action("Command")}
      commandHierarchy={all_hierarchies}
      delay={number("Delay", 500)}
    />
  ))
  .add("500ms", () => (
    <KeyMap
      onResponse={action("Command")}
      commandHierarchy={all_hierarchies}
      delay={500}
    />
  ))
  .add("no delay", () => (
    <KeyMap onResponse={action("Command")} commandHierarchy={all_hierarchies} />
  ))
  .add("windows", () => (
    <KeyMap
      layoutName="windows"
      demo
      onResponse={action("Command")}
      commandHierarchy={all_hierarchies}
    />
  ))

  .add("windows-laptop", () => (
    <KeyMap
      layoutName="windows-laptop"
      demo
      onResponse={action("Command")}
      commandHierarchy={all_hierarchies}
    />
  ))
  .add("surface", () => (
    <KeyMap
      layoutName="surface"
      demo
      onResponse={action("Command")}
      commandHierarchy={all_hierarchies}
    />
  ))
  .add("macbook", () => (
    <KeyMap
      layoutName="macbook"
      demo
      onResponse={action("Command")}
      commandHierarchy={all_hierarchies}
    />
  ))
  .add("mac", () => (
    <KeyMap
      layoutName="mac"
      demo
      onResponse={action("Command")}
      commandHierarchy={all_hierarchies}
    />
  ));

storiesOf("menus/KeyMap/Key", module)
  .add("nothing", () => <Key label="a" type="letter" />)
  .add("modifier", () => (
    <Key type="modifier" label="control" id="control" synmbol="^" />
  ))
  .add("command", () => <Key command="search" label="g" id="g" />)
  .add("long command", () => (
    <Key command="search for all files" label="g" id="g" type="letter" />
  ))
  .add("submenu", () => <Key submenu="Go to" label="g" id="g" type="letter" />);
