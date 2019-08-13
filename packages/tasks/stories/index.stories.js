import React from "react";

import { storiesOf } from "@storybook/react";
import { action } from "@storybook/addon-actions";

import DevTools from "../src/tasks/DevTools";

storiesOf("DevTools", module).add("example", () => <DevTools />);
