import React from 'react'

export default class extends React.Component {
  componentDidMount() {
    window.onAdvanceWorkflow = this.props.onAdvanceWorkflow

    window.nTimes = n => {
      for (var i = 0; i < n; i++) {
        window.onAdvanceWorkflow()
      }
    }

    window.onAdvanceWorkflowLevelTo = this.props.onAdvanceWorkflowLevelTo
  }

  componentWillUnmount() {
    delete window.onAdvanceWorkflowLevelTo
    delete window.onAdvanceWorkflow
  }
}
