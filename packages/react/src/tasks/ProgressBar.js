import React from "react";
import { LinearProgress } from "@material-ui/core";
import {
  getConfigAtIndex,
  indexToTaskNumber,
  getTotalTasks,
  __INDEX__,
  getLeafIndex,
} from "@hcikit/workflow";
import { withRawConfiguration } from "../core/withRawConfiguration";

import { withGridItem } from "../GridLayout";
import PropTypes from "prop-types";

// BUG: I think there might be an off by one error, check the example

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

ProgressBar.propTypes = {
  configuration: PropTypes.object,
  depth: PropTypes.number,
};

ProgressBar = withGridItem(ProgressBar, "footer");

export { ProgressBar };

export default withRawConfiguration(ProgressBar);
