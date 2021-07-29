import React from "react";
import {
  getConfigurationAtIndex,
  indexToTaskNumber,
  getTotalTasks,
  getCurrentIndex,
  getLeafIndex,
} from "@hcikit/workflow";

import { withGridItem } from "../GridLayout";
import PropTypes from "prop-types";
import { useConfiguration } from "../core/Experiment";

const ProgressTextNoGrid: React.FunctionComponent<{ depth?: number }> = ({
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

  return (
    <div>
      {currentTaskNumber + 1} / {totalTasks}
    </div>
  );
};

const ProgressText = withGridItem(ProgressTextNoGrid, "footer");

ProgressText.propTypes = {
  depth: PropTypes.number,
};

export { ProgressText };

export default ProgressText;
