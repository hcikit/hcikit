import React from 'react'
import styled from 'styled-components'
import { Button } from '@material-ui/core'
import PropTypes from 'prop-types'

const LeftCenter = styled.div`
  position: absolute;
  top: 50%;
  left: 25%;
  transform: translate(-50%, -50%);
`
const MousePositioner = ({ onAdvanceWorkflow }) => {
  return (
    <LeftCenter>
      <Button onClick={onAdvanceWorkflow}>Next</Button>
    </LeftCenter>
  )
}

MousePositioner.propTypes = {
  onAdvanceWorkflow: PropTypes.func
}

export default MousePositioner
