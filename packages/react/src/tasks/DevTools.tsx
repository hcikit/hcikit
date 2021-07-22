import React, { useEffect, useState } from "react";
import { IconButton, Slider, Card } from "@material-ui/core";
import {
  FastForward,
  SkipNext,
  SkipPrevious,
  FastRewind,
} from "@material-ui/icons";
import styled from "styled-components";
import {
  taskNumberToIndex,
  indexToTaskNumber,
  getPropsFor,
  getLeafIndex,
  getTotalTasks,
  getCurrentIndex,
} from "@hcikit/workflow";

import PropTypes from "prop-types";
import { useConfig, useExperiment } from "../core/Experiment";

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

// TODO: move to the bottom right or somewhere instead.
// TODO: find a better way to represent labels, maybe a way to expand it?
// TODO: add other things like a reset session or soemthing

export const DevTools: React.FunctionComponent = () => {
  const configuration = useConfig();
  const experiment = useExperiment();

  const [isDragging, setIsDragging] = useState(false);
  const [relativePosition, setRelativePosition] = useState({ x: 0, y: 0 });

  const [position, setPosition] = useState({ top: 0, left: 0 });

  useEffect(() => {
    function handleMouseMove(e: MouseEvent) {
      if (isDragging) {
        // TODO: use bottom right instead.
        setPosition({
          top: e.pageY - relativePosition.y,
          left: e.pageX - relativePosition.x,
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
    // TODO: I've done something wrong here. Like quite wrong.
  }, []);

  // TODO: set the marks to the top level sections

  if (process.env.NODE_ENV === "production") {
    return null;
  }

  let topLevelTasks: Array<{ value: number; label: string | undefined }> = [];

  if (configuration.children) {
    topLevelTasks = configuration.children.map((_: unknown, i: number) => ({
      value: indexToTaskNumber(configuration, getLeafIndex([i], configuration)),
      label: getPropsFor([i], configuration).task,
    }));
  }

  return (
    <StyledCard
      onMouseDown={(e: React.MouseEvent) => {
        setIsDragging(true);
        setRelativePosition({
          x: e.pageX - position.left,
          y: e.pageY - position.top,
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
        <IconButton onClick={experiment.taskComplete}>
          <FastForward />
        </IconButton>
        <IconButton>
          <SkipNext />
        </IconButton>
      </Controls>
      <StyledSlider
        step={1}
        valueLabelDisplay="auto"
        value={indexToTaskNumber(configuration, getCurrentIndex(configuration))}
        marks={topLevelTasks}
        min={0}
        max={getTotalTasks(configuration)}
        onChange={(_: React.ChangeEvent<{}>, value: number | Array<number>) => {
          experiment.setWorkflowIndex(
            taskNumberToIndex(configuration, value as number)
          );
        }}
      />
    </StyledCard>
  );
};

DevTools.propTypes = {
  configuration: PropTypes.object,
  setWorkflowIndex: PropTypes.func,
  taskComplete: PropTypes.func,
};

export default DevTools;
