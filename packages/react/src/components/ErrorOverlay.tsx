import React from "react";
import { Paper } from "@mui/material";
import styled from "styled-components";

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
