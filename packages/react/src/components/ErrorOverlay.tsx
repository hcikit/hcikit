import React from "react";
import styled from "styled-components";
import { Paper } from "@mui/material";

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

const ErrorOverlay: React.FunctionComponent = ({ children }) => {
  return (
    <Overlay>
      <ErrorPane>{children}</ErrorPane>
    </Overlay>
  );
};

export default ErrorOverlay;
