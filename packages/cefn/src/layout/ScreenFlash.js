import React from "react";
import styled, { keyframes } from "styled-components";
import { isEqual } from "lodash";

export class ScreenFlash extends React.Component {
  state = { displayed: false };
  componentWillReceiveProps(newProps) {
    if (!isEqual(newProps.times, this.props.times)) {
      this.interval = setInterval(this.resetState, 500);
      this.setState({ displayed: true });
    }
  }

  componentWillUnmount() {
    clearInterval(this.interval);
  }

  resetState = () => {
    this.setState({ displayed: false });
  };

  render() {
    return this.state.displayed && <Flash />;
  }
}

const flashAnimation = keyframes`
  from {
    opacity: 0.5;
  }
  to {
    opacity: 0;
  }
`;

const Flash = styled.div`
  position: absolute;
  width: 100%;
  height: 100%;
  z-index: 999;
  pointer-events: none;
  opacity: 0.5;
  animation: ${flashAnimation} 0.5s;
  background: red;
`;
