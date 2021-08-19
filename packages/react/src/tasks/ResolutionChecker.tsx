import { Typography } from "@material-ui/core";
import { noop } from "lodash";
import React, { useEffect, useMemo, useState } from "react";
import ErrorOverlay from "../components/ErrorOverlay";
import { ControlFunctions } from "../core/Experiment";

// TODO: there is a bug where if you fix one of the resoltuion problems, the view doesn't update. It's because the state doesn';t change. Need to write a repro test.

const ResolutionChecker: React.FunctionComponent<{
  minXResolution?: number;
  maxXResolution?: number;
  minYResolution?: number;
  maxYResolution?: number;
  log?: ControlFunctions["log"];
}> = ({
  minXResolution,
  maxXResolution,
  minYResolution,
  maxYResolution,
  log = noop,
}) => {
  const [validResolution, setValidResolution] = useState(true);

  let conditions = useMemo(
    () => [
      {
        condition: () =>
          minXResolution ? window.innerWidth >= minXResolution : true,
        dimension: "minXResolution",
        message:
          "Your window is too small. The width must be at least " +
          minXResolution +
          "px.",
      },
      {
        condition: () =>
          maxXResolution ? window.innerWidth <= maxXResolution : true,
        dimension: "maxXResolution",
        message:
          "Your window is too big. The width must be smaller than " +
          maxXResolution +
          "px.",
      },
      {
        condition: () =>
          minYResolution ? window.innerHeight >= minYResolution : true,
        dimension: "minYResolution",
        message:
          "Your window is too small. The height must be at least " +
          minYResolution +
          "px.",
      },
      {
        condition: () =>
          maxYResolution ? window.innerHeight <= maxYResolution : true,
        dimension: "maxYResolution",
        message:
          "Your window is too big. The height must be smaller than " +
          maxYResolution +
          "px.",
      },
    ],
    [maxXResolution, maxYResolution, minXResolution, minYResolution]
  );

  useEffect(() => {
    function handleResize() {
      setValidResolution(conditions.every(({ condition }) => condition()));
      log({
        type: "resize",
        valid: conditions.every(({ condition }) => condition()),
        width: window.innerWidth,
        height: window.innerHeight,
        failingDimensions: conditions
          .filter(({ condition }) => !condition())
          .map(({ dimension }) => dimension),
      });
    }

    handleResize();

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [conditions, log]);

  if (!validResolution) {
    return (
      <ErrorOverlay>
        {conditions
          .filter((condition) => !condition.condition())
          .map(({ message }, i) => (
            <Typography key={i}>{message}</Typography>
          ))}
      </ErrorOverlay>
    );
  } else {
    return null;
  }
};

export default ResolutionChecker;
