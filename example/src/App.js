import React from "react";
import Experiment, {
  ConsentForm,
  InformationScreen,
  DisplayText,
  ProgressBar,
  WizardProgress,
  DevTools,
  ResolutionChecker,
  FocusChecker,
} from "@hcikit/react";
import IncrementTask from "./IncrementTask";
import CustomTask from "./CustomTask";

import configuration from "./configuration";

let tasks = {
  CustomTask,
  ConsentForm,
  InformationScreen,
  DisplayText,
  ProgressBar,
  WizardProgress,
  DevTools,
  IncrementTask,
  ResolutionChecker,
  FocusChecker,
};

const App = () => {
  return <Experiment tasks={tasks} configuration={configuration} />;
};

export default App;
