import styled from 'styled-components'
import Paper from '@material-ui/core/Paper'

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

// icon: {
//   fontSize: 20,
// },
// iconVariant: {
//   opacity: 0.9,
//   marginRight: theme.spacing.unit,
// },

// // #d32f2f
