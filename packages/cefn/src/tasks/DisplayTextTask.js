import React from 'react'
import Button from '@material-ui/core/Button'
import { CenteredDiv, CenteredText } from '../components'
import PropTypes from 'prop-types'
import { withGridItem } from '../core/App'

/**
 * Creates a simple ane small piece of text in the middle of the screen with a continue button.
 */
const DisplayTextTask = ({ content, onAdvanceWorkflow }) => {
  return (
    <CenteredDiv centerX centerY>
      <CenteredText>
        <h1>{content}</h1>
        <Button variant='contained' color='primary' onClick={onAdvanceWorkflow}>
          Continue
        </Button>
      </CenteredText>
    </CenteredDiv>
  )
}

DisplayTextTask.propTypes = {
  content: PropTypes.string,
  /**  @ignore */
  onAdvanceWorkflow: PropTypes.func
}

export default withGridItem(DisplayTextTask)
