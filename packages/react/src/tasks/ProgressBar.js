import React from "react";
import { LinearProgress } from "@material-ui/core";
import {
  getConfigAtIndex,
  indexToTaskNumber,
  getTotalTasks,
  getCurrentIndex,
  getLeafIndex,
} from "@hcikit/workflow";

import { withGridItem } from "../GridLayout";
import PropTypes from "prop-types";
import { useConfig } from "../core/Experiment";

// BUG: I think there might be an off by one error, check the example

let ProgressBar = ({ depth = 0 }) => {
  let configuration = useConfig();

  let index = getCurrentIndex(configuration);
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

export default ProgressBar;
