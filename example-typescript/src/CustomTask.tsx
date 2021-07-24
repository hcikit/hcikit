import { useExperiment } from "@hcikit/react";
import React from "react";

const CustomTask: React.FunctionComponent<{ text: string }> = ({ text }) => {
  let experiment = useExperiment();
  return <button onClick={() => experiment.advance()}>{text}</button>;
};

export default CustomTask;
