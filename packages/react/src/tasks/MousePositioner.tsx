import React from "react";
import styled from "styled-components";
import { Button } from "@material-ui/core";
import PropTypes from "prop-types";
import { useExperiment } from "../core/Experiment";

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
      <Button onClick={experiment.taskComplete}>Next</Button>
    </LeftCenter>
  );
};

MousePositioner.propTypes = {
  taskComplete: PropTypes.func,
};

export default MousePositioner;
