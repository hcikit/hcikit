import React from "react";
import { Stepper, Step, StepLabel, LinearProgress } from "@material-ui/core";

import { map, sum } from "lodash-es";
import { connect } from "react-redux";
import styled from "styled-components";

// TODO: this class is very broken right now, and needs work anyways to make it work with gridlayouts instead

const Progress = styled.div`
  position: fixed;
  left: 0;
  right: 0;
  ${({ position }) => (position === "top" ? "top: 0;" : "bottom: 0;")};
`;

const ExperimentProgress = ({
  log,
  onAdvanceWorkflowLevelTo,
  fullProgress = true,
  currentProgress = false,
  position = "top"
}) => {
  var curIndex = 0;
  var indices = [];
  for (let i = 0; i < log.children.length; i++) {
    if (log.children[i].noProgress) {
      curIndex--;
    } else {
      indices.push(i);
    }
  }

  let newIndex = 0;

  while (log.index > indices[newIndex]) {
    newIndex++;
  }

  let progressSections = log.children.filter(child => !child.noProgress);
  let sections = map(progressSections, "label");
  let progress = 0;

  function hasProgressLevel(cur) {
    if (cur.ExperimentProgress) {
      return cur.ExperimentProgress.progressLevel;
    } else {
      return cur.progressLevel;
    }
  }

  if (currentProgress) {
    let cur = log;
    while (!hasProgressLevel(cur)) {
      cur = cur.children[cur.index || 0];
    }

    progress = 100 * ((getCurrentChild(cur) - 1) / getAllChildren(cur));
  }

  return (
    <React.Fragment>
      {currentProgress && (
        <Progress position={position}>
          <LinearProgress
            style={{ height: "8px" }}
            variant="determinate"
            value={progress}
          />
        </Progress>
      )}
      {fullProgress && (
        <Stepper activeStep={newIndex}>
          {sections.map((label, index) => {
            return (
              <Step
                style={{
                  cursor:
                    process.env.NODE_ENV === "development"
                      ? "pointer"
                      : "default"
                }}
                onClick={() => {
                  if (process.env.NODE_ENV === "development") {
                    onAdvanceWorkflowLevelTo("section", indices[index]);
                  }
                }}
                key={label}
              >
                <StepLabel>{label}</StepLabel>
              </Step>
            );
          })}
        </Stepper>
      )}
    </React.Fragment>
  );
};

export default connect(state => ({
  log: state.Configuration
}))(ExperimentProgress);

function getAllChildren(config) {
  if (config.children) {
    return sum(config.children.map(getAllChildren));
  } else {
    return 1;
  }
}

function getCurrentChild(config) {
  // BaseCase:
  if (!config.children) {
    return 1;
  } else {
    return sum(
      config.children.slice(0, (config.index || 0) + 1).map(getCurrentChild)
    );
  }
}
