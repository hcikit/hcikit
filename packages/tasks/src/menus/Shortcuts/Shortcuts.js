import { Component } from 'react'
import { eventToKey, isModifier } from './ShortcutUtils'
import { chordArrayToString } from '../Shortcuts/ShortcutUtils'
import { connect } from 'react-redux'
import {
  toggleModifier,
  setModifier,
  resetShortcuts,
  addToPath,
  delayOver
} from './Shortcuts.actions'

// TODOLATER: right now keyboard isn't reset when changing focus to the developer console or soemthing, just when not visible
// FIXMELATER: currently it only takes valid, sorted hierarchies.
// TODOLATER: should it always try to convert a menu to a command hierarchy? could set an instance letiable and always reference that, merge the command hierarchy with the menu converted one.

export class Shortcuts extends Component {
  render() {
    return null
  }

  componentDidMount() {
    document.addEventListener('keyup', this.handleKeyboard, false)
    document.addEventListener('keydown', this.handleKeyboard, false)
    document.addEventListener('visibilitychange', this.handleVisibilityChange)

    if (this.props.onRef) {
      this.props.onRef(this)
    }
  }

  componentWillUnmount() {
    document.removeEventListener('keyup', this.handleKeyboard, false)
    document.removeEventListener('keydown', this.handleKeyboard, false)
    document.removeEventListener(
      'visibilitychange',
      this.handleVisibilityChange
    )

    this.props.onResetShortcuts()
    clearTimeout(this.delayTimeRunning)
  }

  handleVisibilityChange = () => {
    if (document.hidden) {
      this.props.onResetShortcuts()
    }
  }

  getCurrentModifiers() {
    return Object.keys(this.props.modifiersPressed)
      .filter(key => this.props.modifiersPressed[key])
      .sort()
  }

  handleKeyboard = e => {
    let key = eventToKey(e)

    if (isModifier(key)) {
      this.handleModifier(key, e.type)
    } else {
      this.handleKey(key, e.type)
    }

    if (e.preventDefault) {
      e.preventDefault()
    }
  }

  handleModifier(modifier, type) {
    if (type === 'click') {
      this.props.onToggleModifier(modifier)
    } else {
      this.props.onSetModifier(modifier, type === 'keydown')
    }

    // TODOLATER: this might not be ideal, what happens if I am in the middle of a submenu and want to cancel. The next command I enter will be from the submenu. This needs a timeout.

    // TODOLATER: do we need to reset if no modifiers are pressed?
    // if (this.props.path.length + this.getCurrentModifiers().length === 0) {
    //   this.props.onResetShortcuts();
    // }

    if (type === 'click') {
      this.props.onDelayOver()
    } else if (this.getCurrentModifiers().length) {
      if (!this.props.delayTimeOver && !this.delayTimeRunning) {
        this.delayTimeRunning = setTimeout(
          this.props.onDelayOver,
          this.props.delay
        )
      }
    } else {
      clearTimeout(this.delayTimeRunning)
      delete this.delayTimeRunning
    }

    if (this.props.onModifiersChanged) {
      this.props.onModifiersChanged()
    }
  }

  handleKey(key, type) {
    if (key === ' ') {
      return
    }
    // Handles if a command was issued and the letter wasn't released.
    if (type === 'keydown' || type === 'click') {
      // It's a regular key
      const currentHierarchy = this.props.path.reduce(
        (prev, current) => prev[current],
        this.props.commandHierarchy
      )

      if (!currentHierarchy) {
        return
      }

      const submenuOrCommand =
        currentHierarchy[chordArrayToString(this.getCurrentModifiers())] &&
        currentHierarchy[chordArrayToString(this.getCurrentModifiers())][key]

      if (submenuOrCommand === undefined) {
        // No command under that selection....
        // This shortcut is not a command or submenu

        this.props.onResetShortcuts()
        this.props.onResponse(null)
      } else if ('command' in submenuOrCommand) {
        // This was a command not a submenu

        // TODOLATER: make events fire manually when clicking.
        // if (type === "click") {
        //   this.detachFromWindow();
        //   window.dispatchEvent(new KeyboardEvent());
        //   window.dispatchEvent(new KeyboardEvent());
        //   this.attachToWindow();
        // }
        this.props.onResponse(submenuOrCommand.command, {
          delayOver: this.props.delayTimeOver,
          type
        })
        this.props.onResetShortcuts()
      } else {
        // submenu, and we add current path to the entered path
        this.props.onAddToPath(chordArrayToString(this.getCurrentModifiers()))
        this.props.onAddToPath(key)
      }
    }
  }
}

const ConnectedShortcuts = connect(
  state => {
    return { ...state.Shortcuts }
  },
  {
    onResetShortcuts: resetShortcuts,
    onToggleModifier: toggleModifier,
    onSetModifier: setModifier,
    onAddToPath: addToPath,
    onDelayOver: delayOver
  },
  undefined
)(Shortcuts)

export default ConnectedShortcuts
