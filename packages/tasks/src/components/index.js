import styled from 'styled-components'
import Paper from '@material-ui/core/Paper'
import React from 'react'
import propTypes from 'prop-types'

export const NicePaper = styled(Paper)`
  max-width: 800px;
  width: 100%;
  margin: 20px;
  padding: 20px;
`

export const FlexCenter = styled.div`
  height: 100%;
  width: 100%;
  display: flex;
  align-items: ${({ centerY }) => (centerY ? 'center' : 'flex-start')};
  justify-content: ${({ centerX }) => (centerX ? 'center' : 'flex-start')};
`

export const CenteredDiv = ({ children, centerX = true, centerY = false }) => (
  <FlexCenter centerX={centerX} centerY={centerY}>
    <div>{children}</div>
  </FlexCenter>
)

CenteredDiv.propTypes = {
  children: propTypes.oneOfType([
    propTypes.arrayOf(propTypes.node),
    propTypes.node
  ]).isRequired,
  centerX: propTypes.bool,
  centerY: propTypes.bool
}

export const CenteredNicePaper = ({
  children,
  centerX = true,
  centerY = false
}) => (
  <CenteredDiv centerX={centerX} centerY={centerY}>
    <NicePaper>{children}</NicePaper>
  </CenteredDiv>
)

CenteredNicePaper.propTypes = {
  children: propTypes.oneOfType([
    propTypes.arrayOf(propTypes.node),
    propTypes.node
  ]).isRequired,
  centerX: propTypes.bool,
  centerY: propTypes.bool
}

export const CenteredText = styled.div`
  text-align: center;
`

export { LinearTimer } from './LinearTimer'
export { ScreenFlash } from './ScreenFlash'
export { default as SnackBar } from './Snackbar'
