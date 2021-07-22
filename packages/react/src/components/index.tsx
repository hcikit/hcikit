import styled from "styled-components";
import { Paper } from "@material-ui/core";
import React from "react";
import PropTypes from "prop-types";

export const NicePaper = styled(Paper)`
  max-width: 800px;
  margin: 20px;
  padding: 20px;
`;

export const FlexCenter = styled.div<{ centerX?: boolean; centerY?: boolean }>`
  height: 100%;
  width: 100%;
  display: flex;
  align-items: ${({ centerY }) => (centerY ? "center" : "flex-start")};
  justify-content: ${({ centerX }) => (centerX ? "center" : "flex-start")};
`;

FlexCenter.propTypes = {
  centerX: PropTypes.bool,
  centerY: PropTypes.bool,
};

export const CenteredDiv: React.FunctionComponent<{
  centerX?: boolean;
  centerY?: boolean;
}> = ({ children, centerX = true, centerY = false }) => (
  <FlexCenter centerX={centerX} centerY={centerY}>
    <div>{children}</div>
  </FlexCenter>
);

CenteredDiv.propTypes = {
  centerX: PropTypes.bool,
  centerY: PropTypes.bool,
};

export const CenteredNicePaper: React.FunctionComponent<{
  centerX?: boolean;
  centerY?: boolean;
}> = ({ children, centerX = true, centerY = false }) => (
  <CenteredDiv centerX={centerX} centerY={centerY}>
    <NicePaper>{children}</NicePaper>
  </CenteredDiv>
);

CenteredNicePaper.propTypes = {
  centerX: PropTypes.bool,
  centerY: PropTypes.bool,
};

export const CenteredText = styled.div`
  text-align: center;
`;

export { LinearTimer } from "./LinearTimer";
export { ScreenFlash } from "./ScreenFlash";
