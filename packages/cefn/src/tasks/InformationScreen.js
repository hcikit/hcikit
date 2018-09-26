import React from 'react'
import marked from 'marked'

import Typography from '@material-ui/core/Typography'
import Button from '@material-ui/core/Button'

import { CenteredPaper } from '../layout'

export default ({ content, withContinue = true, onAdvanceWorkflow }) => {
  return (
    <CenteredPaper axis='vertical'>
      <Typography dangerouslySetInnerHTML={{ __html: marked(content) }} />
      <br />
      {withContinue && (
        <Button color='primary' onClick={onAdvanceWorkflow}>
          continue
        </Button>
      )}
    </CenteredPaper>
  )
}
