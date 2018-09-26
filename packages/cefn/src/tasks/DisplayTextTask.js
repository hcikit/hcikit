import React, { Component } from 'react'
import Button from '@material-ui/core/Button'
import { CenteredDiv, CenteredText } from '../layout'

export default class DisplayTextTask extends Component {
  render() {
    return (
      <CenteredText>
        <CenteredDiv className='display-task-container centered'>
          <h1>{this.props.displayedText}</h1>
          <Button
            variant='contained'
            color='primary'
            onClick={() => this.props.onAdvanceWorkflow()}
          >
            Continue
          </Button>
        </CenteredDiv>
      </CenteredText>
    )
  }
}
