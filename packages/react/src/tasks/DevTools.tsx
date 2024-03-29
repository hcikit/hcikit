/* eslint-disable react/jsx-pascal-case */
import React, { useEffect, useState } from "react";
import { IconButton, Slider, Card, Button } from "@mui/material";
import FastForward from "@mui/icons-material/FastForward.js";
import SkipNext from "@mui/icons-material/SkipNext.js";
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

import { useConfiguration, useExperiment } from "../index.js";

import _styled from "@emotion/styled";

const styled: typeof _styled =
  ((_styled as unknown as { default: typeof _styled })
    .default as typeof _styled) || _styled;

// TODO: making all of material ui icons a peer dependency instead of a dependency seems silly when they're probably just svgs abnd not dependent on the rest of material ui.

const StyledCard = styled(Card)`
  display: flex;
  flex-direction: column;
  gap: 5px;
  position: fixed;
  padding: 10px;
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
 * find a better way to represent labels, maybe a way to expand it?
 */

export const DevTools: React.FunctionComponent<{
  showInProduction: boolean;
}> = ({ showInProduction = false }) => {
  const configuration = useConfiguration();
  const experiment = useExperiment();

  const [isShowing, setIsShowing] = useState(true);

  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === "escape") {
        setIsShowing((prev) => !prev);
      }
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, []);

  // const [isDragging, setIsDragging] = useState(false);
  // const [position, setPosition] = useState({ top: 0, left: 0 });

  // // TODO: I broke dragging
  // useEffect(() => {
  //   function handleMouseMove(e: MouseEvent) {
  //     if (isDragging) {
  //       // TODO: use bottom right instead.
  //       setPosition({
  //         top: e.pageY,
  //         left: e.pageX,
  //       });
  //     }
  //     console.log(isDragging);
  //   }

  //   function handleMouseUp() {
  //     setIsDragging(false);
  //   }

  //   window.addEventListener("mousemove", handleMouseMove);
  //   window.addEventListener("mouseup", handleMouseUp);

  //   return () => {
  //     window.removeEventListener("mouseup", handleMouseUp);
  //     window.removeEventListener("mousemove", handleMouseMove);
  //   };
  //   // TODO: I've done something wrong here. Like quite wrong.
  // }, [isDragging]);

  // TODO: set the marks to the top level sections

  if (
    (process.env.NODE_ENV === "production" && !showInProduction) ||
    !isShowing
  ) {
    return null;
  }

  let topLevelTasks: Array<{ value: number; label: string | undefined }> = [];

  if (configuration.children) {
    topLevelTasks = configuration.children.map((_: unknown, i: number) => ({
      value: indexToTaskNumber(configuration, getLeafIndex(configuration, [i])),
      label: getPropsFor(configuration, [i]).task,
    }));
  }

  // return null;
  return (
    <StyledCard style={{ bottom: 0, left: 0, zIndex: 1000 }}>
      <p style={{ textAlign: "center" }}>HCI Kit Devtools</p>
      <Controls>
        <IconButton
          onClick={() => {
            let currentIndex = getCurrentIndex(configuration);
            let newIndex = currentIndex.slice(
              0,
              currentIndex.length > 1 ? currentIndex.length - 1 : 1
            );

            experiment.log({
              type: "DEVTOOLS_CHANGE",
              subtype: "prev_section",
            });

            newIndex[newIndex.length - 1] = newIndex[newIndex.length - 1] - 1;
            experiment.advance(getLeafIndex(configuration, newIndex));
          }}
        >
          {/* @ts-ignore */}
          <SkipPrevious.default />
        </IconButton>
        <IconButton
          onClick={() => {
            experiment.log({
              type: "DEVTOOLS_CHANGE",
              subtype: "prev_trial",
            });

            experiment.advance(
              taskNumberToIndex(
                configuration,
                indexToTaskNumber(
                  configuration,
                  getCurrentIndex(configuration)
                ) - 1
              )
            );
          }}
        >
          {/* @ts-ignore */}
          <FastRewind.default />
        </IconButton>
        <IconButton
          onClick={() => {
            experiment.log({
              type: "DEVTOOLS_CHANGE",
              subtype: "next_trial",
            });
            experiment.advance();
          }}
        >
          {/* @ts-ignore */}
          <FastForward.default />
          {/* <div className="cursor-pointer" onClick={() => experiment.advance()}>
            Next &gt;
          </div> */}
        </IconButton>
        <IconButton
          onClick={() => {
            let currentIndex = getCurrentIndex(configuration);
            let newIndex = currentIndex.slice(
              0,
              currentIndex.length > 1 ? currentIndex.length - 1 : 1
            );

            newIndex[newIndex.length - 1] = newIndex[newIndex.length - 1] + 1;
            experiment.log({
              type: "DEVTOOLS_CHANGE",
              subtype: "next_section",
            });
            experiment.advance(getLeafIndex(configuration, newIndex));
          }}
        >
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
          experiment.log({
            type: "DEVTOOLS_CHANGE",
            subtype: "slider_tool",
          });
          experiment.advance(taskNumberToIndex(configuration, value as number));
        }}
      />
      <Button onClick={() => experiment.persistence?.flush()}>
        Clear Storage
      </Button>
    </StyledCard>
  );
};

export default DevTools;
