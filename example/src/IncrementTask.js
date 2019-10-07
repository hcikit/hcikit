import React from "react";
import { CenteredNicePaper, withGridItem } from "@hcikit/tasks";
import { Typography } from "@material-ui/core";
import { Button } from "@material-ui/core";

const IncrementTask = ({
  desiredValue,
  value = 0,
  modifyConfigAtDepth,
  taskComplete
}) => {
  function checkAnswer() {
    if (value === desiredValue) {
      taskComplete();
    }
  }

  function decrement() {
    modifyConfigAtDepth({ value: value - 1 });
  }

  function increment() {
    modifyConfigAtDepth({ value: value + 1 });
  }

  function reset() {
    modifyConfigAtDepth({ value: 0 });
  }

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

export default withGridItem(IncrementTask);
