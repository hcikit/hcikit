import React, { Component } from "react";

export default class DropdownMenu extends Component {
  render() {
    return (
      <select onChange={this.handleChange.bind(this)}>
        {this.props.menuItems.map((item, i) => <option key={i}>{item}</option>)}
      </select>
    );
  }

  handleChange(e) {
    this.props.onResponse(e.target.value);
  }
}
