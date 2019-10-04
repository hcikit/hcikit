import React from "react";

export default ({ text, taskComplete }) => {
  return <button onClick={taskComplete}>{text}</button>;
};
