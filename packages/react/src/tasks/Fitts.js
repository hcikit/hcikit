import React from "react";
import { range, noop } from "lodash-es";
import styled from "styled-components";
import PropTypes from "prop-types";
import { withGridItem } from "../GridLayout";

const Target = styled.circle`
  fill: ${({ active }) => (active ? "#FF8080" : "#ccc")};
  opacity: ${({ active }) => (active ? 1 : 0.5)};
`;

const FullSVG = styled.svg`
  height: 100vh;
  width: auto;
  margin: auto;
  display: block;
`;

const Fitts = ({
  numTargets,
  distance,
  width,
  targetIndex,
  taskComplete,
  idPrefix = "",
}) => {
  // TODO: Needs to have a way of saying "expand to max"
  // TODO: my radius is probably wrong to be honest.
  let theta = (Math.PI * 2) / numTargets;
  let radius = distance;

  return (
    <FullSVG
      height={"100%"}
      viewBox={`-50 -50 100 100`}
      xmlns="http://www.w3.org/2000/svg"
    >
      {range(numTargets).map((i) => {
        // SVG has no depth so we do some magic to make sure that the target circle is painted last.
        i = (targetIndex + i + 1) % numTargets;
        let active = i === targetIndex;
        let rotation = theta * i;
        let id = `fitts-${idPrefix}-${i}`;
        return (
          <Target
            id={id}
            key={id}
            cx={Math.cos(rotation) * radius}
            cy={Math.sin(rotation) * radius}
            r={width}
            active={active}
            onClick={active ? taskComplete : noop}
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
  taskComplete: PropTypes.func,
};

export { Fitts };

export default withGridItem(Fitts);
