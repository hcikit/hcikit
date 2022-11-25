import React from "react";
import { isEqual } from "lodash-es";
import PropTypes from "prop-types";
import { keyframes } from "@mui/styled-engine";
import _styled from "@emotion/styled";

const styled: typeof _styled =
  ((_styled as unknown as { default: typeof _styled })
    .default as typeof _styled) || _styled;

export class ScreenFlash extends React.Component<{ times: number }> {
  propTypes = {
    times: PropTypes.number,
  };

  state = { displayed: false };
  interval?: NodeJS.Timer;
  UNSAFE_componentWillReceiveProps(newProps: { times: number }): void {
    if (!isEqual(newProps.times, this.props.times)) {
      this.interval = setInterval(this.resetState, 500);
      this.setState({ displayed: true });
    }
  }

  componentWillUnmount(): void {
    if (this.interval) {
      clearInterval(this.interval);
    }
  }

  resetState = (): void => {
    this.setState({ displayed: false });
  };

  render(): JSX.Element | null {
    return this.state.displayed ? <Flash /> : null;
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
