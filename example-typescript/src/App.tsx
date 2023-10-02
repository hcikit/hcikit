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

export let tasks = {
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

const App: React.FC = () => {
  // @ts-ignore
  return <Experiment tasks={tasks} configuration={configuration} />;
};

export default App;
