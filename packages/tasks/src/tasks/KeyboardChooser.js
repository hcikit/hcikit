import React from 'react'
import { Row } from '../menus/KeyMap/KeyMap'
import { bottomRows } from '../menus/KeyMap/KeyMapConstants'
import Button from '@material-ui/core/Button'

import '../menus/KeyMap/KeyMap.css'
import { CenteredNicePaper } from '../components'

const KeyboardChooser = ({ onEditConfig, onAdvanceWorkflow }) => {
  return (
    <CenteredNicePaper centerX width='1100px'>
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
              onEditConfig('layoutName', entry[0])
              onAdvanceWorkflow()
            }}
            variant='contained'
            color='primary'
          >
            Select Layout
          </Button>
          <br />
        </div>
      ))}
    </CenteredNicePaper>
  )
}
export default KeyboardChooser
