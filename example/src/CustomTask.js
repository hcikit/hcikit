import React from "react";
import { useExperiment } from "@hcikit/react";

const CustomTask = ({ text }) => {
  let experiment = useExperiment();
  return <button onClick={() => experiment.advance()}>{text}</button>;
};

export default CustomTask;
