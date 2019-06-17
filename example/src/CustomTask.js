import React from "react";

export default ({ text, onAdvanceWorkflow }) => {
  return <button onClick={onAdvanceWorkflow}>{text}</button>;
};
