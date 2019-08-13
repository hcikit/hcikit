import React from "react";
import { IconButton, Slider, Card } from "@material-ui/core";
import {
  FastForward,
  SkipNext,
  SkipPrevious,
  FastRewind
} from "@material-ui/icons";
import styled from "styled-components";

const StyledCard = styled(Card)`
  display: inline-block;
`;
const Controls = styled.div`
  display: flex;
`;
const StyledSlider = styled(Slider)`
  margin-left: 10px;
  margin-right: 10px;
`;

export default ({ config }) => {
  // TODO: making the slider work might be super tricky. Say you complete later in the experiment and leave "index" filled out somewhere, then go backwards, then do experiment as normal. Now when you catch up it will break. It might be better to instead store a single index at the top level like: [1,2,3], but that might require rewriting the advanceworkflow function etc. But it does make advanceworkflowlevelto super easy...

  // TODO: set the marks to the top level sections

  const topLevelTasks = configuration.children.map((_, i) => ({
    value: getTaskNumber([i]),
    label: getTaskNumber([i])
  }));

  let currentIndex = 5;

  return (
    <StyledCard>
      <Controls>
        <IconButton>
          <SkipPrevious />
        </IconButton>
        <IconButton>
          <FastRewind />
        </IconButton>
        <IconButton>
          <FastForward />
        </IconButton>
        <IconButton>
          <SkipNext />
        </IconButton>
      </Controls>
      <StyledSlider
        step={1}
        valueLabelDisplay="auto"
        value={getCurrentIndex(config)}
        marks={topLevelTasks}
        min={0}
        max={totalTasks}
        onChange={() =>
          advanceWorkflowLevelTo(taskNumberToIndex(config, e.value))
        }
      />
    </StyledCard>
  );
};

// class extends React.Component {
//   componentDidMount() {
//     window.onAdvanceWorkflow = this.props.onAdvanceWorkflow

//     window.nTimes = n => {
//       for (var i = 0; i < n; i++) {
//         window.onAdvanceWorkflow()
//       }
//     }

//     window.onAdvanceWorkflowLevelTo = this.props.onAdvanceWorkflowLevelTo
//   }

//   componentWillUnmount() {
//     delete window.onAdvanceWorkflowLevelTo
//     delete window.onAdvanceWorkflow
//   }
// }
