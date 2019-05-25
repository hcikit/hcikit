import React from "react";
import { range, noop } from "lodash";
import styled from "styled-components";

const Target = styled.circle`
  fill: ${({ active }) => (active ? "#FF8080" : "#ccc")};
  opacity: ${({ active }) => (active ? 1 : 0.5)};
`;

const FullSVG = styled.svg`
  position: fixed;
  top: 0;
  left: 0;
  height: 100%;
  width: 100%;
`;

export default ({
  numTargets,
  distance,
  width,
  targetIndex,
  onAdvanceWorkflow,
  idPrefix = ""
}) => {
  // TODO: Needs to have a way of saying "expand to max"
  // TODO: my radius is probably wrong to be honest.
  let theta = (Math.PI * 2) / numTargets;
  let radius = distance;

  return (
    <FullSVG
      width={"100%"}
      viewBox={`-50 -50 100 100`}
      xmlns="http://www.w3.org/2000/svg"
    >
      {range(numTargets).map(i => {
        // SVG has no depth so we do some magic to make sure that the target circle is painted last.
        i = (targetIndex + i + 1) % numTargets;
        let active = i === targetIndex;
        let rotation = theta * i;

        return (
          <Target
            id={`fitts-${idPrefix}-${i}`}
            cx={Math.cos(rotation) * radius}
            cy={Math.sin(rotation) * radius}
            r={width}
            active={active}
            onClick={active ? onAdvanceWorkflow : noop}
          />
        );
      })}
    </FullSVG>
  );
};
