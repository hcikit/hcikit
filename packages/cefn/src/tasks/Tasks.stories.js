import React from 'react'
import { storiesOf } from '@storybook/react'
import { action } from '@storybook/addon-actions'
import { withKnobs, text } from '@storybook/addon-knobs'

import DisplayTextTask from './DisplayTextTask'

import { UploadToS3Display } from './UploadToS3'

import GoogleFormQuestionnaire from './GoogleFormQuestionnaire'
import MouseCenteringTask from './MouseCenteringTask'
import ConsentForm from './ConsentForm'

import { FittsDisplay } from './Fitts'
import FittsChoice from './FittsChoice'

storiesOf('tasks/MouseCenteringTask', module).add('task', () => (
  <MouseCenteringTask onAdvanceWorkflow={action('advanceWorkflow')} />
))

storiesOf('tasks/GoogleFormQuestionnaire', module)
  .add('form', () => (
    <GoogleFormQuestionnaire
      formId='1FAIpQLScYw8Rd-j9YPeVN2fAuqQa_TpdF2a0h9fn_6wA7A3prHoGIwQ'
      answer='ABC12345'
      onAdvanceWorkflow={action('onAdvanceWorkflow')}
    />
  ))
  .add('prefilled', () => (
    <GoogleFormQuestionnaire
      formId='1FAIpQLScYw8Rd-j9YPeVN2fAuqQa_TpdF2a0h9fn_6wA7A3prHoGIwQ'
      prefillParticipant='entry.812855120'
      participant='test'
      answer='ABC12345'
      onAdvanceWorkflow={action('onAdvanceWorkflow')}
    />
  ))
  .add('preview', () => (
    <GoogleFormQuestionnaire
      formId='1FAIpQLSdjqE29uBllkl7SlY-oWIcI5huop9irdAuCHqFOd8YHrGuGDw/'
      answer='ABC12345'
      onAdvanceWorkflow={action('onAdvanceWorkflow')}
    />
  ))

storiesOf('tasks/DisplayTextTask', module)
  .addDecorator(withKnobs)
  .add('Example', () => (
    <DisplayTextTask
      displayedText={text('Text', 'Example Message')}
      onAdvanceWorkflow={action('advanceWorkflow')}
    />
  ))

storiesOf('tasks/ConsentForm', module).add('form', () => (
  <ConsentForm
    letter={`# Hello world
    this is *markdown*`}
    questions={[
      {
        label: 'I agree of my own free will to participate in the study.',
        required: true
      }
    ]}
    onAdvanceWorkflow={action('onAdvanceWorkflow')}
  />
))

storiesOf('tasks/UploadToS3', module)
  .add('error', () => (
    <UploadToS3Display
      experimenter='experimenter@example.com'
      participant='blaine'
      error
      log={JSON.stringify({ hello: 'world' })}
      onClick={action('onAdvanceWorkflow')}
    />
  ))
  .add('uploading', () => (
    <UploadToS3Display onAdvanceWorkflow={action('onAdvanceWorkflow')} />
  ))

storiesOf('tasks/FittsDisplay', module).add('form', () => (
  <FittsDisplay
    numTargets={9}
    distance={20}
    width={10}
    targetIndex={0}
    onClick={action('onClick')}
  />
))

storiesOf('tasks/FittsChoice', module).add('choice', () => (
  <FittsChoice
    numTargets={9}
    targetIndex={0}
    lDistance={30}
    lWidth={20}
    rDistance={40}
    rWidth={10}
  />
))
