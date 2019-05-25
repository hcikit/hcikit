import React, { Component } from 'react'
import { connect } from 'react-redux'
import { attempt } from './StimulusResponse.actions'
import { CenteredNicePaper } from '../../components'
import { ScreenFlash } from '../../components/ScreenFlash'
import { LinearTimer } from '../../components/LinearTimer'
import PropTypes from 'prop-types'
import { last } from 'lodash'

import styled from 'styled-components'

const stimulusTypes = {
  ImageStimulus,
  TextStimulus
}

const StimulusWrapper = styled.div`
  position: absolute;
  top: ${({ position }) => (position === 'top' ? '25%' : '50%')};
  left: 50%;
  transform: translate(-50%, -50%);
  padding: 10px;
  font-size: 24px;

  ${({ color }) => {
    return (
      color &&
      `border-radius: 20px;
        border-style: solid;
        border-width: 10px;
        border-color:  var(--color-${color});`
    )
  }};
`

// TODO: Still don't love this tbh
export function TextStimulus({ stimulus, position, color }) {
  return (
    <StimulusWrapper color={color} position={position}>
      <p className='text-stimulus'>{stimulus}</p>
    </StimulusWrapper>
  )
}
export function ImageStimulus({
  stimulus,
  stimulusImageExtension,
  stimulusImagePath,
  position,
  color
}) {
  return (
    <StimulusWrapper color={color} position={position}>
      <img
        src={`${stimulusImagePath}/${stimulus}.${stimulusImageExtension}`}
        alt=''
      />
    </StimulusWrapper>
  )
}

// TODO: this doesn't use the gridlayout yet
export class StimulusResponse extends Component {
  static propTypes = {
    delayOnError: PropTypes.number,
    flashOnError: PropTypes.bool,
    continueOnError: PropTypes.bool,
    responseInput: PropTypes.oneOfType([PropTypes.element, PropTypes.string])
      .isRequired
  }
  static defaultProps = {
    continueOnError: true,
    flashOnError: false,
    delayOnError: 0
  }

  render() {
    let ResponseInput = this.props.getTask('ResponseInput')

    // TODO: use the input instead.
    let StimulusType = stimulusTypes[this.props.stimulusType] || TextStimulus

    const errorAttempts = this.props.attempts.filter(
      attempt => !attempt.correct
    )
    const lastAttemptTime = (last(errorAttempts) || { time: -Infinity }).time
    const showError = Date.now() - this.props.delayOnError >= lastAttemptTime

    return (
      <div>
        {this.props.flashOnError && <ScreenFlash times={lastAttemptTime} />}

        {showError ? (
          <React.Fragment>
            <StimulusType {...this.props} />
            <ResponseInput
              {...this.props}
              onResponse={this.validateResponse.bind(this)}
            />
          </React.Fragment>
        ) : (
          <CenteredNicePaper centerX centerY>
            <h1>Incorrect</h1>
            <LinearTimer length={this.props.delayOnError} />
          </CenteredNicePaper>
        )}
      </div>
    )
  }

  validateResponse(response, attributes = {}) {
    const isCorrect =
      JSON.stringify(response) === JSON.stringify(this.props.stimulus)

    attributes.correct = isCorrect

    this.props.onAttempt(attributes)
    this.forceUpdate()

    if (isCorrect) {
      this.props.onAdvanceWorkflow()
    } else {
      if (this.props.continueOnError && !this.props.delayOnError) {
        this.props.onAdvanceWorkflow()
      } else {
        this.timeOut = setTimeout(this.onErrorTimeout, this.props.delayOnError)
      }
    }
  }

  onErrorTimeout = () => {
    if (this.props.continueOnError) {
      this.props.onAdvanceWorkflow()
    }

    this.forceUpdate()
  }
}

export const ConnectedStimulusResponse = connect(
  state => {
    return state.StimulusResponse
  },
  {
    onAttempt: attempt
  }
)(StimulusResponse)

export default ConnectedStimulusResponse
