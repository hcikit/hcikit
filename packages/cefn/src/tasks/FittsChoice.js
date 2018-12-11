import React from 'react'
import styled from 'styled-components'
import { FittsDisplay } from './Fitts'

const Child = styled.div`
  flex: 1;
`

const Container = styled.div`
  display: flex;
  height: 100%;
`
// TODO: which one fired, etc.
const Choice = ({ children }) => {
  return (
    <Container>
      {React.Children.map(children, child => (
        <Child>{child}</Child>
      ))}
    </Container>
  )
}

// TODO: How to deal with performance differences.
export default ({
  rWidth,
  lWidth,
  rDistance,
  lDistance,
  numTargets,
  targetIndex,
  onAdvanceWorkflow
}) => {
  return (
    <Choice>
      <FittsDisplay
        width={lWidth}
        distance={lDistance}
        numTargets={numTargets}
        targetIndex={targetIndex}
        onClick={onAdvanceWorkflow}
      />
      <FittsDisplay
        width={rWidth}
        distance={rDistance}
        numTargets={numTargets}
        targetIndex={targetIndex}
        onClick={onAdvanceWorkflow}
      />
    </Choice>
  )
}
