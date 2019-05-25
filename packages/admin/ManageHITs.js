import React from 'react'
import { Switch, Route } from 'react-router-dom'
import { mturk, s3 } from './mturk'
import {
  Paper,
  Typography,
  Divider,
  FormControl,
  InputLabel,
  Input,
  InputAdornment,
  Button,
  TextField
} from '@material-ui/core'
import { DataTable, WrappedLinkComponent, dateTransform } from './DataTable'
import { filter, map } from 'lodash'

function getAllHits(params, data = [], results) {
  if (results) {
    data = data.concat(results.HITs)
  }
  console.log(results)

  if (results === undefined || results.NextToken) {
    if (results) {
      params.NextToken = results.NextToken
    }

    return mturk
      .listHITs({
        ...params
      })
      .promise()
      .then(getAllHits.bind(undefined, params, data))
  } else {
    return data
  }
}

class HITDetail extends React.Component {
  state = { hit: {}, amount: '', reason: '' }

  componentDidMount() {
    mturk
      .getHIT({ HITId: this.props.match.params.id })
      .promise()
      .then(hit => {
        this.setState({ hit: hit.HIT })
      })
  }

  getAssignments = () => {
    let bonuses = mturk
      .listBonusPayments({
        HITId: this.props.match.params.id,
        MaxResults: 100
      })
      .promise()
      .then(data => {
        const workers = {}

        data.BonusPayments.forEach(bonus => {
          workers[bonus.WorkerId] = bonus
        })

        return workers
      })

    let assignments = mturk
      .listAssignmentsForHIT({
        HITId: this.props.match.params.id,
        MaxResults: 100
      })
      .promise()
      .then(data => {
        return data.Assignments.filter(
          assignment => assignment.AssignmentStatus === 'Approved'
        )
      })

    let completedFollowup = s3
      .listObjectsV2({ Bucket: 'exii-experiment-uploads' })
      .promise()
      .then(data => {
        let d = data.Contents.map(object => {
          let [workerId, session] = object.Key.split('.')[0].split('_')
          return { workerId, session }
        })

        let workers = {}

        map(filter(d, { session: 'RECALL' }), 'workerId').forEach(w => {
          workers[w] = true
        })

        return workers
      })

    return Promise.all([assignments, bonuses, completedFollowup]).then(
      ([assignments, bonuses, completedFollowup]) => {
        assignments.forEach(assignment => {
          if (bonuses[assignment.WorkerId]) {
            assignment.Bonus = bonuses[assignment.WorkerId]
            console.log(bonuses[assignment.WorkerId])
          }
          if (completedFollowup[assignment.WorkerId]) {
            assignment['Completed Followup'] = true
          }
        })

        this.setState({ assignments })

        return assignments
      }
    )
  }

  handleChange = prop => event => {
    this.setState({ [prop]: event.target.value })
  }

  handleSubmit = () => {
    // TODO: move to textual piece, create a dry run that overwrites the function being called and records attempts to call it.
    if (!this.state.amount || this.state.amount > 5) {
      console.log('whoops too much money!')
      return
    }

    if (this.state.reason === '') {
      console.log('needs a reason')
      return
    }

    this.state.assignments.forEach(
      ({ WorkerId, AssignmentId, ...worker }, index) => {
        if (worker['Completed Followup']) {
          if (worker['Bonus'] === true) {
            console.log(`Not bonusing worker ${WorkerId}, already bonused`)
            return
          }

          let params = {
            BonusAmount: this.state.amount,
            Reason: this.state.reason,
            AssignmentId,
            WorkerId
          }

          // console.log(params);

          mturk
            .sendBonus(params)
            .promise()
            .then(console.log)
        }
      }
    )
  }

  render() {
    const columns = [
      {
        key: 'AssignmentId',
        component: 'th',
        scope: 'row'
      },
      {
        key: 'WorkerId'
      },
      { key: 'Bonus', transform: d => (d ? 'true' : '') },
      { key: 'Completed Followup', transform: d => (d ? 'true' : '') }
    ]

    if (this.state.error) {
      return <div>Error: {JSON.stringify(this.state.error, undefined, 2)}</div>
    } else {
      return (
        <React.Fragment>
          <Paper>
            {this.state.hit && (
              <div>
                <Typography variant='title' gutterBottom>
                  {this.state.hit.Title}
                </Typography>
                <Typography variant='subheading' gutterBottom>
                  {this.state.hit.HITId}
                </Typography>
                <Typography variant='body1' gutterBottom>
                  {this.state.hit.Description}
                </Typography>
              </div>
            )}
            <FormControl>
              <InputLabel htmlFor='adornment-amount'>Amount</InputLabel>
              <Input
                id='adornment-amount'
                value={this.state.amount}
                onChange={this.handleChange('amount')}
                startAdornment={
                  <InputAdornment position='start'>$</InputAdornment>
                }
              />
            </FormControl>
            <TextField
              id='multiline-flexible'
              label='Reason'
              multiline
              rowsMax='4'
              required
              value={this.state.reason}
              onChange={this.handleChange('reason')}
              margin='normal'
            />
            <Button onClick={this.handleSubmit}>Bonus Workers</Button>
            <Divider />
          </Paper>

          <Paper>
            <DataTable columns={columns} fetchData={this.getAssignments} />
          </Paper>
        </React.Fragment>
      )
    }
  }
}

export class HITList extends React.Component {
  getHits = () => {
    return getAllHits({ MaxResults: 100 }).then(data => {
      console.log(data)
      return data
    })
  }
  render() {
    const columns = [
      {
        key: 'HITId',
        component: 'th',
        scope: 'row',
        Component: WrappedLinkComponent,
        to: '/admin/hits'
      },
      {
        transform: dateTransform,
        title: 'Expires',
        key: 'Expiration'
      },
      {
        transform: dateTransform,
        key: 'CreationTime',
        title: 'Created'
      },
      {
        key: 'Title'
      },
      {
        numeric: true,
        key: 'NumberOfAssignmentsPending',
        title: 'Pending'
      },
      {
        numeric: true,
        key: 'NumberOfAssignmentsAvailable',
        title: 'Available'
      },
      {
        numeric: true,
        key: 'NumberOfAssignmentsCompleted',
        title: 'Completed'
      }
    ]
    return (
      <Paper>
        <DataTable columns={columns} fetchData={this.getHits} />
      </Paper>
    )
  }
}

class ManageHITs extends React.Component {
  render() {
    return (
      <React.Fragment>
        <Switch>
          <Route exact path='/admin/hits' component={HITList} />
          <Route exact path='/admin/hits/:id' component={HITDetail} />
        </Switch>
      </React.Fragment>
    )
  }
}

export default ManageHITs
