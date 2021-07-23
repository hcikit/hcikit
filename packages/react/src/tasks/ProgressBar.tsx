import React from "react";
import { LinearProgress } from "@material-ui/core";
import {
  getConfigurationAtIndex,
  indexToTaskNumber,
  getTotalTasks,
  getCurrentIndex,
  getLeafIndex,
} from "@hcikit/workflow";

import { withGridItem } from "../GridLayout";
import PropTypes from "prop-types";
import { useConfig } from "../core/Experiment";

// BUG: I think there might be an off by one error, check the example

const ProgressBarNoGrid: React.FunctionComponent<{ depth?: number }> = ({
  depth = 0,
}) => {
  let configuration = useConfig();

  const index = getCurrentIndex(configuration);
  const rightHalf = index.slice(depth);
  const leftHalf = index.slice(0, depth);

  configuration = getConfigurationAtIndex(leftHalf, configuration);
  const currentTaskNumber = indexToTaskNumber(
    configuration,
    getLeafIndex(rightHalf, configuration)
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
