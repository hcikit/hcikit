import React from "react";
import { LinearProgress } from "@mui/material";
import {
  getConfigurationAtIndex,
  indexToTaskNumber,
  getTotalTasks,
  getCurrentIndex,
  getLeafIndex,
} from "@hcikit/workflow";

import { withGridItem } from "../GridLayout.js";
import PropTypes from "prop-types";
import { useConfiguration } from "../core/Experiment.js";

// BUG: I think there might be an off by one error, check the example

const ProgressBarNoGrid: React.FunctionComponent<{ depth?: number }> = ({
  depth = 0,
}) => {
  let configuration = useConfiguration();

  const index = getCurrentIndex(configuration);
  const rightHalf = index.slice(depth);
  const leftHalf = index.slice(0, depth);

  configuration = getConfigurationAtIndex(configuration, leftHalf);
  const currentTaskNumber = indexToTaskNumber(
    configuration,
    getLeafIndex(configuration, rightHalf)
  );
  const totalTasks = getTotalTasks(configuration);
  const progress = 100 * (currentTaskNumber / (totalTasks - 1));

  return (
    <LinearProgress
      style={{ height: "8px" }}
      variant="determinate"
      value={progress}
    />
  );
};

const ProgressBar = withGridItem(ProgressBarNoGrid, "footer");

ProgressBar.propTypes = {
  depth: PropTypes.number,
};

export { ProgressBar };

export default ProgressBar;
