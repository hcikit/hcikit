import styled from 'styled-components'
import Paper from '@material-ui/core/Paper'
import React from 'react'
import propTypes from 'prop-types'

export const CenteredPaper = styled(Paper)`
  position: absolute;
  ${({ axis }) => axis !== 'horizontal' && `left: 50%`};
  ${({ axis }) => axis !== 'vertical' && `top: 50%`};
  ${({ top }) => `top: ${top}%;`}
  transform: translate(
    ${({ axis }) => (axis !== 'horizontal' ? '-50%' : '0')},
    ${({ axis }) => (axis !== 'vertical' ? '-50%' : '0')}
  );
  width: ${props => props.width || '800px'};
  padding: 20px;
`

export const NicePaper = styled(Paper)`
  max-width: 800px;
  width: 100%;
  margin: 20px;
  padding: 20px;
`

export const FlexCenter = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
`

export const CenteredNicePaper = ({ children }) => (
  <FlexCenter>
    <NicePaper>{children}</NicePaper>
  </FlexCenter>
)

CenteredNicePaper.propTypes = {
  children: propTypes.oneOfType([
    propTypes.arrayOf(propTypes.node),
    propTypes.node
  ]).isRequired
}

export const CenteredText = styled.div`
  text-align: center;
`

export const centered = `position: absolute;
top: 50%;
left: 50%;
transform: translate(-50%, -50%);`

export const CenteredDiv = styled.div`
  ${centered};
`

export { LinearTimer } from './LinearTimer'

export { ScreenFlash } from './ScreenFlash'
// export { default as SnackBar } from './SnackBar'

// icon: {
//   fontSize: 20,
// },
// iconVariant: {
//   opacity: 0.9,
//   marginRight: theme.spacing.unit,
// },

// // #d32f2f
