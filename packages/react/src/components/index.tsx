import { Paper } from "@mui/material";
import React from "react";
import PropTypes from "prop-types";
import _styled from "@emotion/styled";

const styled: typeof _styled =
  ((_styled as unknown as { default: typeof _styled })
    .default as typeof _styled) || _styled;

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
  children: React.ReactNode | React.ReactNode[];
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
  children: React.ReactNode | React.ReactNode[];
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

export { LinearTimer } from "./LinearTimer.js";
export { ScreenFlash } from "./ScreenFlash.js";
export { default as ErrorOverlay } from "./ErrorOverlay.js";
