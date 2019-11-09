import React, { useEffect, useState } from "react";
import { IconButton, Slider, Card } from "@material-ui/core";
import {
  FastForward,
  SkipNext,
  SkipPrevious,
  FastRewind
} from "@material-ui/icons";
import styled from "styled-components";
import {
  taskNumberToIndex,
  indexToTaskNumber,
  getPropsFor,
  __INDEX__,
  getLeafIndex,
  getTotalTasks
} from "@hcikit/workflow";
import { withRawConfiguration } from "../core/withRawConfiguration";

import PropTypes from "prop-types";

const StyledCard = styled(Card)`
  display: inline-block;
  position: fixed;
`;
const Controls = styled.div`
  display: flex;
`;
const StyledSlider = styled(Slider)`
  margin-left: 10px;
  margin-right: 10px;
`;

export const DevTools = ({ taskComplete, configuration, setWorkflowIndex }) => {
  let [isDragging, setIsDragging] = useState(false);
  let [relativePosition, setRelativePosition] = useState();

  let [position, setPosition] = useState({ top: 0, left: 0 });

  useEffect(() => {
    function handleMouseMove(e) {
      if (isDragging) {
        // TODO: use bottom right instead.
        setPosition({
          top: e.pageY - relativePosition.y,
          left: e.pageX - relativePosition.x
        });
      }
    }

    function handleMouseUp() {
      setIsDragging(false);
    }

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);

    return () => {
      window.removeEventListener("mouseup", handleMouseUp);
      window.removeEventListener("mousemove", handleMouseMove);
    };
  });

  // TODO: set the marks to the top level sections

  if (process.env.NODE_ENV === "production") {
    return null;
  }

  const topLevelTasks = configuration.children.map((_, i) => ({
    value: indexToTaskNumber(getLeafIndex([i], configuration), configuration),
    label: getPropsFor([i], configuration).task
  }));

  return (
    <StyledCard
      onMouseDown={e => {
        setIsDragging(true);
        setRelativePosition({
          x: e.pageX - position.left,
          y: e.pageY - position.top
        });
      }}
      style={position}
    >
      <Controls>
        <IconButton>
          <SkipPrevious />
        </IconButton>
        <IconButton>
          <FastRewind />
        </IconButton>
        <IconButton onClick={taskComplete}>
          <FastForward />
        </IconButton>
        <IconButton>
          <SkipNext />
        </IconButton>
      </Controls>
      <StyledSlider
        step={1}
        valueLabelDisplay="auto"
        value={indexToTaskNumber(configuration[__INDEX__], configuration)}
        marks={topLevelTasks}
        min={0}
        max={getTotalTasks(configuration)}
        onChange={(_, value) => {
          setWorkflowIndex(taskNumberToIndex(value, configuration));
        }}
      />
    </StyledCard>
  );
};

DevTools.propTypes = {
  configuration: PropTypes.object,
  setWorkflowIndex: PropTypes.func,
  taskComplete: PropTypes.func
};

export default withRawConfiguration(DevTools);
