import React from "react";
import { LinearProgress } from "@material-ui/core";
import {
  withRawConfiguration,
  getConfigAtIndex,
  indexToTaskNumber,
  getTotalTasks,
  __INDEX__,
  getLeafIndex
} from "@hcikit/workflow";

import { withGridItem } from "../../";

let ProgressBar = ({ depth = 0, configuration }) => {
  let index = configuration[__INDEX__] || [];
  let rightHalf = index.slice(depth);
  let leftHalf = index.slice(0, depth);

  configuration = getConfigAtIndex(leftHalf, configuration);
  let currentTaskNumber = indexToTaskNumber(
    getLeafIndex(rightHalf, configuration),
    configuration
  );
  let totalTasks = getTotalTasks(configuration);
  let progress = 100 * (currentTaskNumber / (totalTasks - 1));

  return (
    <LinearProgress
      style={{ height: "8px" }}
      variant="determinate"
      value={progress}
    />
  );
};

ProgressBar = withGridItem(ProgressBar, "footer");

export { ProgressBar };

export default withRawConfiguration(ProgressBar);