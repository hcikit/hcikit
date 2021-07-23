import { useExperiment } from "@hcikit/react";
import React from "react";

const CustomTask: React.FunctionComponent<{ text: string }> = ({ text }) => {
  let experiment = useExperiment();
  return <button onClick={experiment.taskComplete}>{text}</button>;
};

export default CustomTask;
