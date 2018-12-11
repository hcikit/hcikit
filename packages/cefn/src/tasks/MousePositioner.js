import React from 'react'
import styled from 'styled-components'
import { Button } from '@material-ui/core'

const LeftCenter = styled.div`
  position: absolute;
  top: 50%;
  left: 25%;
  transform: translate(-50%, -50%);
`

export default ({ onAdvanceWorkflow }) => {
  return (
    <LeftCenter>
      <Button onClick={onAdvanceWorkflow}>Next</Button>
    </LeftCenter>
  )
}
