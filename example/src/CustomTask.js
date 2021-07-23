import React from "react";

const CustomTask = ({ text, taskComplete }) => {
  return <button onClick={taskComplete}>{text}</button>;
};

export default CustomTask;
