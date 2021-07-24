import React from "react";
import { useExperiment } from "../../packages/react/dist";

const CustomTask = ({ text }) => {
  let experiment = useExperiment();
  return <button onClick={() => experiment.advance()}>{text}</button>;
};

export default CustomTask;
