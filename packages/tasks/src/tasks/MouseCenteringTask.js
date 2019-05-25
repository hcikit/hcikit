import React, { Component } from 'react'
import styled from 'styled-components'

const Content = styled.span`
  display: table-cell;
  vertical-align: middle;
`

const MouseCenterer = styled.div`
  width: 70px;
  height: 70px;
  white-space: normal;
  border-width: 3px;
  border-style: solid;
  padding: 4px;
  text-align: center;
  font-size: 12px;
  cursor: default;
  font-weight: bold;
  display: table;
  osition: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
`

export default class MouseCenteringTask extends Component {
  constructor(props) {
    super(props)
    this.state = {
      mouseOver: false
    }
    this.buttonRef = React.createRef()
  }

  componentDidMount() {
    document.addEventListener('keydown', this.handleKey, false)
    const box = this.buttonRef.current.getBoundingClientRect()

    if (
      window.mousex > box.left &&
      window.mousex < box.right &&
      window.mousey > box.top &&
      window.mousey < box.bottom
    ) {
      this.setState({ mouseOver: true })
    }
  }

  componentWillUnmount() {
    document.removeEventListener('keydown', this.handleKey, false)
  }

  render() {
    let content = this.state.mouseOver ? 'Press the spacebar' : 'Mouse here'
    return (
      <MouseCenterer
        innerRef={this.buttonRef}
        onMouseOver={() => {
          this.setState({ mouseOver: true })
        }}
        onMouseOut={() => {
          this.setState({ mouseOver: false })
        }}
      >
        <Content>{content}</Content>
      </MouseCenterer>
    )
  }

  handleKey = e => {
    if (e.key === ' ' && this.state.mouseOver) {
      this.props.onAdvanceWorkflow()
    }
  }

  handleClick = e => {
    this.setState({ hasClicked: true })
  }
}
