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
import { ConfigVisualiser } from "./ConfigVisualiser";
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
  ConfigVisualiser,
};

const App: React.FunctionComponent = () => {
  //@ts-ignore
  return <Experiment tasks={tasks} configuration={configuration} />;
};

export default App;
