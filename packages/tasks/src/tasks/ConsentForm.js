import React from "react";
import Markdown from "markdown-to-jsx";

import {
  Button,
  Checkbox,
  FormControlLabel,
  FormControl,
  FormHelperText,
  FormGroup,
  Typography
} from "@material-ui/core";

import { CenteredNicePaper } from "../components";
import PropTypes from "prop-types";
import { withGridItem } from "../withGridItem";

// TODOLATER: needs stars beside required consents.
// TODOLATER: needs testing too, not convinced it works properly
/**
 * This component creates a consent form, it allows for multiple consent questions and renders the letter in markdown.
 */
class ConsentForm extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};
  }
  handleChange = name => event => {
    this.setState({ [name]: event.target.checked });
  };

  requiredFieldNotFilled() {
    let requiredNotFilled = this.props.questions.map(question =>
      question.required ? !this.state[question.label] : true
    );

    return !requiredNotFilled.some(val => !val);
  }

  handleSubmit = () => {
    if (!this.requiredFieldNotFilled()) {
      this.props.onAdvanceWorkflow();
    }
  };

  render() {
    let { letter, questions } = this.props;
    let error = this.requiredFieldNotFilled();

    return (
      <CenteredNicePaper>
        <Typography>
          <Markdown children={letter} />{" "}
        </Typography>
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
                        color="primary"
                      />
                    }
                    label={question.label}
                  />
                </FormGroup>
              );
            })}
            <FormHelperText>Required consent not given.</FormHelperText>

            <Button
              onClick={this.handleSubmit}
              variant="contained"
              color="primary"
            >
              Submit
            </Button>
          </FormGroup>
        </FormControl>
      </CenteredNicePaper>
    );
  }
}

ConsentForm.propTypes = {
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
};

export default withGridItem(ConsentForm, "task");
