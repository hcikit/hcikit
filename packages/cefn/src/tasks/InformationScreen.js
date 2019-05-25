import React, { useEffect } from 'react'
import marked from 'marked'
import Typography from '@material-ui/core/Typography'
import Button from '@material-ui/core/Button'
import { CenteredNicePaper } from '../components'
import PropTypes from 'prop-types'
import { withGridItem } from '../core/App'

/**
 * Creates a screen with information or instructions and a continue button.
 * Accepts Markdown.
 * By setting withContinue to false it can also be used as an end screen of an experiment.
 * Uses a keyboard shortcut when specified.
 */
const InformationScreen = ({
  content,
  withContinue = true,
  onAdvanceWorkflow,
  centerX,
  centerY,
  shortcutEnabled,
  key = 'Enter'
}) => {
  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key === key && shortcutEnabled) {
        onAdvanceWorkflow()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  })

  return (
    <CenteredNicePaper centerX={centerX} centerY={centerY}>
      <Typography dangerouslySetInnerHTML={{ __html: marked(content) }} />
      <br />
      {withContinue && (
        <Button color='primary' onClick={onAdvanceWorkflow}>
          continue {shortcutEnabled && `(${key})`}
        </Button>
      )}
    </CenteredNicePaper>
  )
}

InformationScreen.propTypes = {
  centerX: PropTypes.bool,
  centerY: PropTypes.bool,
  content: PropTypes.string,
  onAdvanceWorkflow: PropTypes.func,
  withContinue: PropTypes.bool,
  shortcutEnabled: PropTypes.bool,
  /* The KeyboardEvent.key value to use as a shortcut */
  key: PropTypes.string
}

export default withGridItem(InformationScreen)
