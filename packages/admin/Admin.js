import React from 'react'
import { Switch, Route, Link } from 'react-router-dom'
import { GenerateConfiguration } from '../../design/GenerateConfiguration'

import Playback from './Playback'
import classNames from 'classnames'

import {
  Toolbar,
  IconButton,
  Icon,
  Typography,
  AppBar,
  Drawer,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  withStyles
} from '@material-ui/core'
import ManageWorkers from './ManageWorkers'
import ManageHITs from './ManageHITs'

// TODO: this should all be inside of a CRA.

const drawerWidth = 240

const styles = theme => ({
  root: {
    flexGrow: 1,
    zIndex: 1,
    overflow: 'hidden',
    position: 'relative',
    display: 'flex'
  },
  appBar: {
    zIndex: theme.zIndex.drawer + 1,
    transition: theme.transitions.create(['width', 'margin'], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen
    })
  },
  appBarShift: {
    marginLeft: drawerWidth,
    width: `calc(100% - ${drawerWidth}px)`,
    transition: theme.transitions.create(['width', 'margin'], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen
    })
  },
  menuButton: {
    marginLeft: 12,
    marginRight: 36
  },
  hide: {
    display: 'none'
  },
  drawerPaper: {
    position: 'relative',
    whiteSpace: 'nowrap',
    width: drawerWidth,
    transition: theme.transitions.create('width', {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen
    })
  },
  drawerPaperClose: {
    overflowX: 'hidden',
    transition: theme.transitions.create('width', {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen
    }),
    width: theme.spacing.unit * 7,
    [theme.breakpoints.up('sm')]: {
      width: theme.spacing.unit * 9
    }
  },
  toolbar: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end',
    padding: '0 8px',
    ...theme.mixins.toolbar
  },
  content: {
    flexGrow: 1,
    backgroundColor: theme.palette.background.default,
    padding: theme.spacing.unit * 3
  }
})

class MiniDrawer extends React.Component {
  state = {
    open: false
  }

  handleDrawerOpen = () => {
    this.setState({ open: true })
  }

  handleDrawerClose = () => {
    this.setState({ open: false })
  }

  render() {
    const { classes, theme } = this.props

    return (
      <div className={classes.root}>
        <AppBar
          position='absolute'
          className={classNames(
            classes.appBar,
            this.state.open && classes.appBarShift
          )}
        >
          <Toolbar disableGutters={!this.state.open}>
            <IconButton
              color='inherit'
              aria-label='Open drawer'
              onClick={this.handleDrawerOpen}
              className={classNames(
                classes.menuButton,
                this.state.open && classes.hide
              )}
            >
              <Icon>menu</Icon>
            </IconButton>
            <Typography variant='title' color='inherit' noWrap>
              Experiment Dashboard
            </Typography>
          </Toolbar>
        </AppBar>
        <Drawer
          variant='permanent'
          classes={{
            paper: classNames(
              classes.drawerPaper,
              !this.state.open && classes.drawerPaperClose
            )
          }}
          open={this.state.open}
        >
          <div className={classes.toolbar}>
            <IconButton onClick={this.handleDrawerClose}>
              {theme.direction === 'rtl' ? (
                <Icon>chevron_right</Icon>
              ) : (
                <Icon>chevron_left</Icon>
              )}
            </IconButton>
          </div>
          <Divider />
          <List>
            <div>
              <ListItem button component={Link} to='/'>
                <ListItemIcon>
                  <Icon>assignment</Icon>
                </ListItemIcon>
                <ListItemText primary='Experiment' />
              </ListItem>
              <ListItem button component={Link} to='/admin/config'>
                <ListItemIcon>
                  <Icon>build</Icon>
                </ListItemIcon>
                <ListItemText primary='Config' />
              </ListItem>
              <ListItem button component={Link} to='/admin/playback'>
                <ListItemIcon>
                  <Icon>replay</Icon>
                </ListItemIcon>
                <ListItemText primary='Playback' />
              </ListItem>
              {/* TODO: should be nested... */}
              <ListItem button component={Link} to='/admin/workers'>
                <ListItemIcon>
                  <Icon>person</Icon>
                </ListItemIcon>
                <ListItemText primary='Manage Workers' />
              </ListItem>
              <ListItem
                button
                component={Link}
                to='/admin/workers/qualifications'
              >
                <ListItemText primary='Qualification' />
              </ListItem>
              <ListItem button component={Link} to='/admin/hits'>
                <ListItemText primary='Hits' />
              </ListItem>
            </div>
          </List>
        </Drawer>
        <main className={classes.content}>
          <div className={classes.toolbar} />
          <Switch>
            <Route
              exact
              path='/admin/config'
              component={GenerateConfiguration}
            />
            <Route exact path='/admin/playback' component={Playback} />
            <Route path='/admin/workers' component={ManageWorkers} />
            <Route path='/admin/hits' component={ManageHITs} />
          </Switch>
        </main>
      </div>
    )
  }
}

export default withStyles(styles, { withTheme: true })(MiniDrawer)
