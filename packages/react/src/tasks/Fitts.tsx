import React from "react";
import { range, noop } from "lodash";
import styled from "styled-components";
import PropTypes from "prop-types";
import { withGridItem } from "../GridLayout";
import { useExperiment } from "../core/Experiment";

const Target = styled.circle<{ active: boolean }>`
  fill: ${({ active }) => (active ? "#FF8080" : "#ccc")};
  opacity: ${({ active }) => (active ? 1 : 0.5)};
`;

const FullSVG = styled.svg`
  height: 100vh;
  width: auto;
  margin: auto;
  display: block;
`;

const Fitts: React.FunctionComponent<{
  numTargets: number;
  distance: number;
  width: number;
  targetIndex: number;
  idPrefix?: string;
}> = ({ numTargets, distance, width, targetIndex, idPrefix = "" }) => {
  // TODO: Needs to have a way of saying "expand to max"
  // TODO: my radius is probably wrong to be honest.
  const theta = (Math.PI * 2) / numTargets;
  const radius = distance;
  const experiment = useExperiment();

  return (
    <FullSVG
      height={"100%"}
      viewBox={`-50 -50 100 100`}
      xmlns="http://www.w3.org/2000/svg"
    >
      {range(numTargets).map((i) => {
        // SVG has no depth so we do some magic to make sure that the target circle is painted last.
        i = (targetIndex + i + 1) % numTargets;
        const active = i === targetIndex;
        const rotation = theta * i;
        const id = `fitts-${idPrefix}-${i}`;
        return (
          <Target
            id={id}
            key={id}
            cx={Math.cos(rotation) * radius}
            cy={Math.sin(rotation) * radius}
            r={width}
            active={active}
            onClick={active ? experiment.taskComplete : noop}
          />
        );
      })}
    </FullSVG>
  );
};

Fitts.propTypes = {
  numTargets: PropTypes.number.isRequired,
  distance: PropTypes.number.isRequired,
  width: PropTypes.number.isRequired,
  targetIndex: PropTypes.number.isRequired,
  idPrefix: PropTypes.string,
};

export { Fitts };

export default withGridItem(Fitts);
