import React from "react";
import { Button } from "@mui/material";
import PropTypes from "prop-types";
import { useExperiment } from "../core/Experiment.js";
import _styled from "@emotion/styled";

const styled: typeof _styled =
  ((_styled as unknown as { default: typeof _styled })
    .default as typeof _styled) || _styled;

const LeftCenter = styled.div`
  position: absolute;
  top: 50%;
  left: 25%;
  transform: translate(-50%, -50%);
`;
const MousePositioner: React.FunctionComponent = () => {
  const experiment = useExperiment();
  return (
    <LeftCenter>
      <Button onClick={() => experiment.advance()}>Next</Button>
    </LeftCenter>
  );
};

MousePositioner.propTypes = {
  advance: PropTypes.func,
};

export default MousePositioner;
