import React from "react";
import { connect } from "react-redux";
import { CenteredNicePaper } from "@blainelewis1/cefn";
import { Typography } from "@material-ui/core";
import { Button } from "@material-ui/core";

let INCREMENT = "INCREMENT";
let DECREMENT = "DECREMENT";
let RESET = "RESET";

let increment = () => ({ type: INCREMENT });
let decrement = () => ({ type: DECREMENT });
let reset = () => ({ type: RESET });

export const reducer = (state = 0, action) => {
  switch (action.type) {
    case INCREMENT:
      return state + 1;
    case DECREMENT:
      return state - 1;
    case RESET:
      return 0;
    default:
      return state;
  }
};

const TaskWithReducer = ({
  value,
  onIncrement,
  onDecrement,
  onReset,
  onAdvanceWorkflow
}) => {
  return (
    <CenteredNicePaper>
      <Typography variant="h1">{value}</Typography>
      <Button onClick={onDecrement}>-</Button>
      <Button onClick={onReset}>RESET</Button>
      <Button onClick={onIncrement}>+</Button>
      <br />
      <Button onClick={onAdvanceWorkflow}>Continue</Button>
    </CenteredNicePaper>
  );
};

export default connect(
  state => ({
    value: state.TaskWithReducer
  }),
  {
    onIncrement: increment,
    onDecrement: decrement,
    onReset: reset
  }
)(TaskWithReducer);
