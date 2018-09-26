import React from 'react'
import { connect } from 'react-redux'

import { editConfig } from '../core/Workflow.actions'
import { Row } from '../menus/KeyMap/KeyMap'
import { bottomRows } from '../menus/KeyMap/KeyMapConstants'
import Button from '@material-ui/core/Button'

import '../menus/KeyMap/KeyMap.css'
import { CenteredPaper } from '../layout'

export class KeyboardChooser extends React.Component {
  render() {
    return (
      <CenteredPaper axis='vertical' width='1100px'>
        <h1> Choose the bottom row of your keyboard that matches best. </h1>
        {Object.entries(bottomRows).map(entry => (
          <div
            style={{ marginBottom: '30px' }}
            className={`keymap active ${entry[0]}`}
            key={entry[0]}
          >
            <Row
              row={entry[1]}
              onKeyClick={() => {}}
              commandsAvailable={{}}
              modifiersPressed={{}}
            />
            <Button
              onClick={() => {
                this.props.onEditConfig('layoutName', entry[0])
                this.props.onAdvanceWorkflow()
              }}
              variant='contained'
              color='primary'
            >
              Select Layout
            </Button>
            <br />
          </div>
        ))}
      </CenteredPaper>
    )
  }
}

export default connect(
  undefined,
  { onEditConfig: editConfig }
)(KeyboardChooser)
