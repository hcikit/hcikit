import React from "react";
import { CenteredNicePaper, useExperiment, withGridItem } from "@hcikit/react";
import { Typography } from "@material-ui/core";
import { Button } from "@material-ui/core";

const IncrementTask: React.FunctionComponent<{
  desiredValue: number;
  value: number;
}> = ({ desiredValue, value = 0 }) => {
  const { modify, advance, log } = useExperiment();
  function checkAnswer() {
    if (value === desiredValue) {
      advance();
    }
  }

  function decrement() {
    modify({ value: value - 1 });
  }

  function increment() {
    modify({ value: value + 1 });
  }

  function reset() {
    modify({ value: 0 });
  }

  return (
    <CenteredNicePaper>
      <div style={{ textAlign: "center" }}>
        <Typography
          variant="h1"
          onMouseOver={() =>
            log.bind({
              type: "rollover",
              value: "Rolled over with mouse",
            })
          }
        >
          {value}
        </Typography>
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
