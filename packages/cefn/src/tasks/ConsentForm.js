import React from 'react'
import marked from 'marked'
// import {
//   Button,
//   FormControlLabel,
//   Checkbox,
//   FormGroup,
//   FormHelperText,
//   FormControl
// } from '@material-ui/core/es/'

// import Button from '@material-ui/core'

import Button from '@material-ui/core/Button'
import FormControlLabel from '@material-ui/core/FormControlLabel'
import Checkbox from '@material-ui/core/Checkbox'
import Typography from '@material-ui/core/Typography'

import FormGroup from '@material-ui/core/FormGroup'
import FormHelperText from '@material-ui/core/FormHelperText'
import FormControl from '@material-ui/core/FormControl'

import { CenteredPaper } from '../layout'
import PropTypes from 'prop-types'

// TODOLATER: needs stars beside required consents.
/**
 * This component creates a consent form, it allows for multiple consent questions and renders the letter in markdown.
 */
export default class ConsentForm extends React.Component {
  static propTypes = {
    /** A string, possible in Markdown, describing what the user is participating to. */
    letter: PropTypes.string,
    /** Each question has a label and a boolean if it is required to continue. */
    questions: PropTypes.arrayOf(
      PropTypes.shape({
        required: PropTypes.bool,
        label: PropTypes.string
      })
    ),
    /**  @ignore */
    onAdvanceWorkflow: PropTypes.func
  }
  constructor(props) {
    super(props)
    this.state = {}
  }
  handleChange = name => event => {
    this.setState({ [name]: event.target.checked })
  }

  requiredFieldNotFilled() {
    let requiredNotFilled = this.props.questions.map(question =>
      question.required ? !this.state[question.label] : true
    )

    return !requiredNotFilled.some(val => !val)
  }

  handleSubmit = () => {
    if (!this.requiredFieldNotFilled()) {
      this.props.onAdvanceWorkflow()
    }
  }

  render() {
    let { letter, questions } = this.props
    let error = this.requiredFieldNotFilled()

    return (
      <CenteredPaper axis='vertical'>
        <Typography dangerouslySetInnerHTML={{ __html: marked(letter) }} />
        <FormControl required error={error}>
          <FormGroup>
            {questions.map(question => {
              return (
                <FormGroup key={question.label}>
                  <FormControlLabel
                    key={question.label}
                    required={question.required}
                    control={
                      <Checkbox
                        onChange={this.handleChange(question.label)}
                        color='primary'
                      />
                    }
                    label={question.label}
                  />
                </FormGroup>
              )
            })}
            <FormHelperText>Required consent not given.</FormHelperText>

            <Button
              onClick={this.handleSubmit}
              variant='contained'
              color='primary'
            >
              Submit
            </Button>
          </FormGroup>
        </FormControl>
      </CenteredPaper>
    )
  }
}
