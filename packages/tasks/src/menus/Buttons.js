import React, { Component } from 'react'
import Button from '@material-ui/core/Button'

export default class Buttons extends Component {
  render() {
    return this.props.menuItems.map(item => (
      <Button id={item} key={item} onClick={() => this.props.onResponse(item)}>
        {item}
      </Button>
    ))
  }
}
