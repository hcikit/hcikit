import React, { useEffect, useState } from "react";
import { IconButton, Slider, Card } from "@mui/material";
import FastForward from "@mui/icons-material/FastForward.js";
import SkipNext from "@mui/icons-material/SkipNext.js";
import SkipPreviousIcon from "@mui/icons-material/SkipPrevious.js";
import SkipPrevious from "@mui/icons-material/SkipPrevious.js";
import FastRewind from "@mui/icons-material/FastRewind.js";

import {
  taskNumberToIndex,
  indexToTaskNumber,
  getPropsFor,
  getLeafIndex,
  getTotalTasks,
  getCurrentIndex,
} from "@hcikit/workflow";

import _styled from "@emotion/styled";

const styled: typeof _styled =
  ((_styled as unknown as { default: typeof _styled })
    .default as typeof _styled) || _styled;

// TODO: making all of material ui icons a peer dependency instead of a dependency seems silly when they're probably just svgs abnd not dependent on the rest of material ui.

import { useConfiguration, useExperiment } from "../core/Experiment.js";

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

/**
 * TODO:
 * move to the bottom right or somewhere instead.
 * find a better way to represent labels, maybe a way to expand it?
 * add other things like a reset session or soemthing
 */

export const DevTools: React.FunctionComponent = () => {
  const configuration = useConfiguration();
  const experiment = useExperiment();

  const [isDragging, setIsDragging] = useState(false);
  const [relativePosition, setRelativePosition] = useState({ x: 0, y: 0 });

  const [position, setPosition] = useState({ top: 0, left: 0 });

  // TODO: I broke dragging
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // TODO: set the marks to the top level sections

  if (process.env.NODE_ENV === "production") {
    return null;
  }

  let topLevelTasks: Array<{ value: number; label: string | undefined }> = [];

  if (configuration.children) {
    topLevelTasks = configuration.children.map((_: unknown, i: number) => ({
      value: indexToTaskNumber(configuration, getLeafIndex(configuration, [i])),
      label: getPropsFor(configuration, [i]).task,
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
          {/* @ts-ignore */}
          <SkipPrevious.default />
        </IconButton>
        <IconButton>
          {/* @ts-ignore */}
          <FastRewind.default />
        </IconButton>
        <IconButton onClick={() => experiment.advance()}>
          {/* @ts-ignore */}
          <FastForward.default />
        </IconButton>
        <IconButton size="large">
          {/* @ts-ignore */}
          <SkipNext.default />
        </IconButton>
      </Controls>
      <StyledSlider
        step={1}
        valueLabelDisplay="auto"
        value={indexToTaskNumber(configuration, getCurrentIndex(configuration))}
        marks={topLevelTasks}
        min={0}
        max={getTotalTasks(configuration)}
        onChange={(_: Event, value: number | Array<number>) => {
          experiment.advance(taskNumberToIndex(configuration, value as number));
        }}
      />
    </StyledCard>
  );
};

export default DevTools;
