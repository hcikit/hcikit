import React, { useEffect, useState } from "react";
import styled from "styled-components";
import { withGridItem } from "../GridLayout";
import { CenteredDiv } from "../components";
import PropTypes from "prop-types";
import { useExperiment } from "../core/Experiment";

const Content = styled.span`
  display: table-cell;
  vertical-align: middle;
`;

const MouseCenterer = styled.div`
  width: 70px;
  height: 70px;
  white-space: normal;
  border-width: 3px;
  border-style: solid;
  padding: 4px;
  text-align: center;
  font-size: 12px;
  cursor: default;
  font-weight: bold;
  display: table;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
`;

// TODO: what about if the mouse is already over the spot we need it to be.
const MouseCenteringTask: React.FunctionComponent = () => {
  const [mouseOver, setMouseOver] = useState(false);

  // const buttonRef = useRef();

  const experiment = useExperiment();

  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === " " && mouseOver) {
        experiment.taskComplete();
      }
    }
    document.addEventListener("keydown", handleKey, false);

    // TODO: test if the mouse is already over the element
    /* if (
      window.mousex > box.left &&
      window.mousex < box.right &&
      window.mousey > box.top &&
      window.mousey < box.bottom
    ) {
      this.setState({ mouseOver: true });
    }*/

    return () => document.removeEventListener("keydown", handleKey);
  }, [experiment, mouseOver]);

  const content = mouseOver ? "Press the spacebar" : "Mouse here";
  return (
    <CenteredDiv>
      <MouseCenterer
        onMouseOver={() => {
          setMouseOver(true);
        }}
        onMouseOut={() => {
          setMouseOver(false);
        }}
      >
        <Content>{content}</Content>
      </MouseCenterer>
    </CenteredDiv>
  );
};

MouseCenteringTask.propTypes = {
  taskComplete: PropTypes.func,
};

export default withGridItem(MouseCenteringTask);