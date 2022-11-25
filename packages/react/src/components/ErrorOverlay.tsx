import React from "react";

import { Paper } from "@mui/material";

import _styled from "@emotion/styled";

const styled: typeof _styled =
  ((_styled as unknown as { default: typeof _styled })
    .default as typeof _styled) || _styled;

const Overlay = styled.div`
  position: absolute;
  background-color: #e57373;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  z-index: 9999;
  display: flex;
  justify-content: center;
  align-items: center;
`;

const ErrorPane = styled(Paper)`
  max-width: 400px;
  width: 90%;
  margin: auto;
  padding: 50px;
`;

interface Props {
  children: React.ReactNode | React.ReactNode[];
}

const ErrorOverlay: React.FunctionComponent<Props> = ({ children }) => {
  return (
    <Overlay>
      <ErrorPane>{children}</ErrorPane>
    </Overlay>
  );
};

export default ErrorOverlay;
