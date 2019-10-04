import React from "react";
import { connect } from "react-redux";
import { CenteredNicePaper, withGridItem } from "@hcikit/tasks";
import { Typography } from "@material-ui/core";
import { Button } from "@material-ui/core";

let INCREMENT = "INCREMENT";
let DECREMENT = "DECREMENT";
let RESET = "RESET";

let increment = () => ({ type: INCREMENT });
let decrement = () => ({ type: DECREMENT });
let reset = () => ({ type: RESET });

// TODO: Match to docs
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

const IncrementTask = ({
  desiredValue,
  value,
  increment,
  decrement,
  reset,
  taskComplete
}) => {
  function checkAnswer() {
    if (value === desiredValue) {
      taskComplete();
    }
  }

  console.log(value);

  return (
    <CenteredNicePaper>
      <div style={{ textAlign: "center" }}>
        <Typography variant="h1">{value}</Typography>
        <Button onClick={decrement}>-</Button>
        <Button onClick={reset}>RESET</Button>
        <Button onClick={increment}>+</Button>
        <br />
        <Typography variant="body1">
          Set the value to {desiredValue} and then continue.
        </Typography>
        <br />
        <Button onClick={checkAnswer}>Continue</Button>
      </div>
    </CenteredNicePaper>
  );
};

export default withGridItem(
  connect(
    state => ({
      value: state.IncrementTask
    }),
    {
      increment,
      decrement,
      reset
    }
  )(IncrementTask)
);
