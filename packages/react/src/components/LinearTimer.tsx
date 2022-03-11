import styled, { keyframes } from "styled-components";
import React from "react";

const times: Array<React.ReactElement> = [];

const createAnimation = (time: number) => {
  const widthAnimation = keyframes`
    from {
      width: 0%;
    }
    to {
      width: 100%;
    }
  `;
  const AnimatedInner = styled(Inner)`
    animation: ${widthAnimation} ${time / 1000}s linear;
  `;
  return (
    <Outer>
      <AnimatedInner />
    </Outer>
  );
};

const getAnimation = (time: number) => {
  if (!times[time]) {
    times[time] = createAnimation(time);
  }

  return times[time];
};

console.log(styled);
console.log("UHMMMMMMMMMMMMMMMMMMMMMMM");

const Outer = styled.div`
  background-color: rgb(240, 132, 171);
  width: 100%;
  overflow: hidden;
  height: 5px;
`;
const Inner = styled.div`
  background-color: rgb(225, 0, 80);
  height: 100%;
`;
export const LinearTimer: React.FunctionComponent<{ length: number }> = ({
  length,
}) => getAnimation(length);
