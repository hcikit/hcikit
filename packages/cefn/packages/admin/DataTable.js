import React from 'react'
import {
  CircularProgress,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody
} from '@material-ui/core'

import { Link } from 'react-router-dom'

// TODO: we could also have the promise return a function to get the next row as well, and then support pagination somehow...
// TODO: hmmm, this is a bumch mixed together. This should juts take data.
// TODO: There's another component that takes a promise or something and displays an error or whatever until the data comes.
// TODO: pagination becomes really hard unless you pass that data to the table too.
// TODO: should look at adding checkboxes as well.

export const dateTransform = date => {
  return new Date(date).toDateString()
}

export class DataTable extends React.Component {
  state = {
    data: undefined,
    error: undefined
  }

  componentWillReceiveProps(newProps) {
    if (newProps.fetchData !== this.props.fetchData) {
      this.getData()
    }
  }

  getData = () => {
    this.props
      .fetchData()
      .then(data => {
        this.setState({ data })
      })
      .catch(error => this.setState({ error }))
  }

  componentDidMount() {
    this.getData()
  }

  render() {
    if (this.state.error) {
      return <div>Error: {JSON.stringify(this.state.error, undefined, 2)}</div>
    } else if (this.state.data) {
      return (
        <Table>
          <TableHead>
            <TableRow>
              {this.props.columns.map(({ title, key }) => (
                <TableCell key={title || key}>{title || key}</TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {this.state.data.map((row, index) => (
              <Row row={row} key={index} columns={this.props.columns} />
            ))}
          </TableBody>
        </Table>
      )
    } else {
      return (
        <div>
          <CircularProgress size={50} />
        </div>
      )
    }
  }
}

// let columns = [{
//   id : "propToMap",
//   title: "Pretty Name or ",
//   ... props to pass to the Cell
// }];

// TODO: links still need to be done.
const Cell = ({ content, transform, Component, ...props }) => {
  if (transform) {
    content = transform(content)
  }

  if (Component) {
    return (
      <TableCell {...props}>
        <Component {...props} content={content}>
          {content}
        </Component>
      </TableCell>
    )
  } else {
    return <TableCell {...props}>{content}</TableCell>
  }
}

export const WrappedLinkComponent = ({ content, to, children, ...props }) => {
  return <Link to={`${to}/${content}`}>{children}</Link>
}

const Row = ({ row, columns }) => {
  return (
    <TableRow>
      {columns.map(({ key, title, ...props }) => {
        return <Cell key={key} content={row[key || title]} {...props} />
      })}
    </TableRow>
  )
}
