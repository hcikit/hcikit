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

export const ConsentForm: React.FunctionComponent<{
  content: string;
  questions: Array<{ label: string; required: boolean }>;
}> = ({ content, questions }) => {
  const [answers, setAnswers] = useState(
    questions.reduce<Record<string, boolean>>((prev, { label }) => {
      prev[label] = false;
      return prev;
    }, {})
  );

  const isFormComplete = () => {
    // Every value determines whether or not it is in the needed position. If it is optional, that is always true. Otherwise, it is the value of the current thing.
    const requiredNotFilled = questions.map((question) =>
      question.required ? answers[question.label] : true
    );

    // If any of these are false,
    return requiredNotFilled.every(Boolean);
  };

  const experiment = useExperiment();

  return (
    <CenteredNicePaper>
      <Markdown>{content}</Markdown>
      <FormControl required error={!isFormComplete()}>
        <FormGroup>
          {questions.map((question) => {
            return (
              <FormGroup key={question.label}>
                <FormControlLabel
                  key={question.label}
                  control={
                    <Checkbox
                      required={Boolean(question.required)}
                      onChange={(event) =>
                        setAnswers({
                          ...answers,
                          [question.label]: event.target.checked,
                        })
                      }
                      color="primary"
                    />
                  }
                  label={`${question.required ? "* " : ""}${question.label}`}
                />
              </FormGroup>
            );
          })}
          <FormHelperText>Required consent not given.</FormHelperText>

          <Button
            onClick={() => {
              if (isFormComplete()) {
                experiment.advance();
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
