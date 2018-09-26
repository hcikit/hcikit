import React from 'react'
import { Switch, Route, Link } from 'react-router-dom'
import { mturk, s3 } from './mturk'
import {
  CircularProgress,
  Paper,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Typography,
  withStyles,
  Button,
  Icon,
  Divider
} from '@material-ui/core'
import { CSVtoArray } from '../../Utils'
import { uniqBy } from 'lodash'

const styles = theme => ({
  rightIcon: {
    marginLeft: theme.spacing.unit
  }
})
const SetQualifications = withStyles(styles)(({ classes, ...props }) => (
  <Button
    {...props}
    variant='contained'
    color='primary'
    className={classes.button}
  >
    Sync Qualifications
    <Icon className={classes.rightIcon}>send</Icon>
  </Button>
))

// TODO: can this be generalised...
function getAllQualifications(params, data = [], results) {
  if (results) {
    data = data.concat(results.Qualifications)
  }

  if (results === undefined || results.NextToken) {
    if (results) {
      params.NextToken = results.NextToken
    }

    return mturk
      .listWorkersWithQualificationType({
        ...params
      })
      .promise()
      .then(getAllQualifications.bind(undefined, params, data))
  } else {
    return data
  }
}

class QualificationDetail extends React.Component {
  state = { workersWithout: [] }
  componentDidMount() {
    this.loadData()
  }

  loadData = () => {
    let id = '1Rg70vDdfuIwEjJFdStZVgwGMDkPg3vUNi2ZB31oUZBg'
    let base = `https://docs.google.com/spreadsheets/d/${id}/gviz/tq?tqx=out:csv`

    mturk
      .getQualificationType({
        QualificationTypeId: this.props.match.params.id
      })
      .promise()
      .then(qualification =>
        this.setState({ qualification: qualification.QualificationType })
      )

    Promise.all([
      getAllQualifications({
        QualificationTypeId: this.props.match.params.id,
        MaxResults: 100
      }),
      s3
        .listObjectsV2({
          Bucket: 'exii-experiment-uploads'
        })
        .promise()
        .then(data => {
          data = data.Contents.map(object => ({
            date: Date.parse(object.LastModified),
            workerId: object.Key.split('.')[0].split('_')[0],
            source: 's3'
          }))

          return data
        }),
      fetch(base)
        .then(res => res.text())
        .then(data => {
          data = data.split('\n').map(CSVtoArray)
          data = data.slice(1).map(row => ({
            date: Date.parse(row[0]),
            workerId: row[1],
            source: 'preQuestionnaire'
          }))

          return data
        })
    ]).then(([workersWith, s3, questionnaire]) => {
      let alreadyAssigned = {}
      workersWith.forEach(
        qualification => (alreadyAssigned[qualification.WorkerId] = true)
      )

      let workersWithout = uniqBy([...s3, ...questionnaire], 'workerId').filter(
        worker => !alreadyAssigned[worker.workerId]
      )

      this.setState({ workersWithout })
    })
  }

  syncQualifications = () => {
    let promises = []

    this.state.workersWithout.forEach(({ workerId }) => {
      var params = {
        QualificationTypeId: this.props.match.params.id /* required */,
        WorkerId: workerId /* required */,
        SendNotification: false
      }

      promises.push(mturk.associateQualificationWithWorker(params).promise())
    })

    Promise.all(promises)
      .then(this.loadData)
      .catch(this.loadData)
  }

  render() {
    if (this.state.error) {
      return <div>Error: {JSON.stringify(this.state.error, undefined, 2)}</div>
    } else {
      const headers = ['WorkerID', 'Date', 'Source']
      return (
        <Paper>
          {this.state.qualification && (
            <div>
              <Typography variant='title' gutterBottom>
                {this.state.qualification.Name}
              </Typography>
              <Typography variant='subheading' gutterBottom>
                {this.state.qualification.QualificationTypeId}
              </Typography>
              <Typography variant='body1' gutterBottom>
                {this.state.qualification.Description}
              </Typography>
            </div>
          )}

          <SetQualifications onClick={this.syncQualifications} />

          <Divider />
          <Table>
            <TableHead>
              <TableRow>
                {headers.map(heading => (
                  <TableCell key={heading}>{heading}</TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {this.state.workersWithout.map(row => {
                return (
                  <TableRow key={row.workerId}>
                    <TableCell component='th' scope='row'>
                      {row.workerId}
                    </TableCell>
                    <TableCell>{new Date(row.date).toDateString()}</TableCell>
                    <TableCell>{row.source}</TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </Paper>
      )
    }
  }
}

class QualificationList extends React.Component {
  state = {}
  componentDidMount() {
    this.loadData()
  }
  // TODO: could write code that autofetches everything at once, then generalise these stupid components.
  // TODO: just write a picker, and have that map columns etc. Pass a function into the component, and the rest as props.
  loadData(
    MaxResults = 20,
    MustBeRequestable = true,
    MustBeOwnedByCaller = true,
    NextToken
  ) {
    const params = {
      NextToken,
      MustBeRequestable,
      MaxResults,
      MustBeOwnedByCaller
    }
    mturk.listQualificationTypes(params, (error, data) => {
      this.setState({ error, data })
    })
  }
  // TODO: load all of the workers with the qualification we want on our account.
  render() {
    let headers = ['ID', 'Name', 'Description']
    if (this.state.error) {
      return <div>Error: {JSON.stringify(this.state.error, undefined, 2)}</div>
    } else if (this.state.data) {
      return (
        <Paper>
          <Table>
            <TableHead>
              <TableRow>
                {headers.map(heading => (
                  <TableCell key={heading}>{heading}</TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {this.state.data.QualificationTypes.map(row => {
                return (
                  <TableRow key={row.QualificationTypeId}>
                    <TableCell component='th' scope='row'>
                      <Link to={`qualifications/${row.QualificationTypeId}`}>
                        {row.QualificationTypeId}
                      </Link>
                    </TableCell>
                    <TableCell>{row.Name}</TableCell>
                    <TableCell>{row.Description}</TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </Paper>
      )
      // <div>{JSON.stringify(this.state.data, undefined, 2)}</div>;
    } else {
      return (
        <div>
          <CircularProgress size={50} />
        </div>
      )
    }
  }
}

export class ListWorkers extends React.Component {
  state = { data: [] }
  componentDidMount() {
    this.loadData()
  }

  loadData() {
    s3.listObjectsV2({ Bucket: 'exii-experiment-uploads' }, (error, data) => {
      if (error) {
        this.setState({ error })
      } else {
        let d = data.Contents.map(object => ({
          date: Date.parse(object.LastModified),
          workerId: object.Key.split('.')[0].split('_')[0],
          source: 's3'
        }))
        this.setState({ data: [...this.state.data, ...d] })
      }
    })

    let id = '1Rg70vDdfuIwEjJFdStZVgwGMDkPg3vUNi2ZB31oUZBg'
    let base = `https://docs.google.com/spreadsheets/d/${id}/gviz/tq?tqx=out:csv`
    fetch(base)
      .then(res => res.text())
      .then(data => {
        data = data.split('\n').map(CSVtoArray)
        data = data.slice(1).map(row => ({
          date: Date.parse(row[0]),
          workerId: row[1],
          source: 'preQuestionnaire'
        }))

        this.setState({ data: [...this.state.data, ...data] })
      })
  }

  render() {
    if (this.state.error) {
      return <div>Error: {JSON.stringify(this.state.error, undefined, 2)}</div>
    } else if (this.state.data.length > 0) {
      const headers = ['WorkerID', 'Date', 'Source']
      return (
        <Paper>
          <Table>
            <TableHead>
              <TableRow>
                {headers.map(heading => (
                  <TableCell key={heading}>{heading}</TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {this.state.data.map(row => {
                return (
                  <TableRow>
                    <TableCell component='th' scope='row'>
                      {row.workerId}
                    </TableCell>
                    <TableCell>{new Date(row.date).toDateString()}</TableCell>
                    <TableCell>{row.source}</TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </Paper>
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

class ManageWorkers extends React.Component {
  render() {
    return (
      <React.Fragment>
        <Switch>
          <Route
            exact
            path='/admin/workers/qualifications'
            component={QualificationList}
          />
          <Route
            exact
            path='/admin/workers/qualifications/:id'
            component={QualificationDetail}
          />
          <Route exact path='/admin/workers' component={ListWorkers} />
        </Switch>
      </React.Fragment>
    )
  }
}

export default ManageWorkers
