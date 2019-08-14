import React from "react";
import { IconButton, Slider, Card } from "@material-ui/core";
import {
  FastForward,
  SkipNext,
  SkipPrevious,
  FastRewind
} from "@material-ui/icons";
import styled from "styled-components";
import { withRawConfiguration } from "@hcikit/workflow/src";
import {
  taskNumberToIndex,
  indexToTaskNumber,
  getPropsFor,
  __INDEX__,
  getLeafIndex
} from "@hcikit/workflow/src/core/Workflow";

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

export const DevTools = ({ configuration, setWorkflowIndex }) => {
  // TODO: set the marks to the top level sections

  const topLevelTasks = configuration.children.map((_, i) => ({
    value: indexToTaskNumber(getLeafIndex([i]), configuration),
    label: getPropsFor([i], configuration).task
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
        value={indexToTaskNumber(config[__INDEX__], configuration)}
        marks={topLevelTasks}
        min={0}
        max={totalTasks}
        onChange={() =>
          setWorkflowIndex(taskNumberToIndex(e.value, configuration))
        }
      />
    </StyledCard>
  );
};

export default withRawConfiguration(DevTools);

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
