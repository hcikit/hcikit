import React from "react";
import Markdown from "markdown-to-jsx";

import {
  Button,
  Checkbox,
  FormControlLabel,
  FormControl,
  FormHelperText,
  FormGroup,
} from "@material-ui/core";

import { CenteredNicePaper } from "../components";
import { withGridItem } from "../GridLayout";
import { useState } from "react";
import { useExperiment } from "../core/Experiment";

// TODO: needs stars beside required consents.
// TODO: needs testing too, not convinced it works properly
export const ConsentForm: React.FunctionComponent<{
  letter: string;
  questions: Array<{ label: string; required: boolean }>;
}> = ({ letter, questions }) => {
  const [answers, setAnswers] = useState(
    questions.reduce<Record<string, boolean>>((prev, { label }) => {
      prev[label] = false;
      return prev;
    }, {})
  );

  const requiredFieldNotFilled = () => {
    const requiredNotFilled = questions.map((question) =>
      question.required ? !answers[question.label] : true
    );

    return !requiredNotFilled.some((val) => !val);
  };

  const error = requiredFieldNotFilled();

  const experiment = useExperiment();

  return (
    <CenteredNicePaper>
      <Markdown>{letter}</Markdown>
      <FormControl required error={error}>
        <FormGroup>
          {questions.map((question) => {
            return (
              <FormGroup key={question.label}>
                <FormControlLabel
                  key={question.label}
                  // required={question.required}
                  control={
                    <Checkbox
                      onChange={(event) =>
                        setAnswers({
                          ...answers,
                          [question.label]: event.target.checked,
                        })
                      }
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
            onClick={() => {
              if (!requiredFieldNotFilled()) {
                experiment.taskComplete();
              }
            }}
            variant="contained"
            color="primary"
          >
            Submit
          </Button>
        </FormGroup>
      </FormControl>
    </CenteredNicePaper>
  );
};

export default withGridItem(ConsentForm, "task");
