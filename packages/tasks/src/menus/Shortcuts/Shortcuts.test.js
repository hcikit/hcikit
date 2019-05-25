import Shortcuts from './Shortcuts'
import { mount } from 'enzyme'
import React from 'react'
import { mergeCommandHierarchy } from './CommandHierarchies'
import { createStore, combineReducers } from 'redux'
import ShortcutsReducer from './Shortcuts.reducers'
let state = () => wrapper.find('Shortcuts').instance()
let wrapper
let handlers = {}

let reducer = combineReducers({ Shortcuts: ShortcutsReducer })

describe('integration tests', () => {
  beforeEach(() => {
    handlers = {
      onModifiersChanged: jest.fn(),
      onResponse: jest.fn(),
      onNoCommand: jest.fn()
    }

    let commandHierarchy = {
      control: {
        c: {
          command: 'copy'
        },
        g: {
          control: {
            f: {
              command: 'submenu'
            }
          },
          meta: {
            s: {
              command: 'different submenu'
            }
          }
        }
      },
      'meta+control': {
        z: {
          command: 'undo'
        }
      },
      'meta+shift': {
        '/': {
          command: 'show commands'
        }
      }
    }

    commandHierarchy = mergeCommandHierarchy({}, commandHierarchy)
    const store = createStore(reducer)
    wrapper = mount(
      <Shortcuts
        store={store}
        commandHierarchy={commandHierarchy}
        {...handlers}
      />
    )
  })

  it('fires modifiers changed', () => {
    expect(handlers.onModifiersChanged).not.toHaveBeenCalled()
    state().handleKeyboard({ key: 'control', type: 'keydown' })
    expect(handlers.onModifiersChanged).toHaveBeenCalled()
  })

  it('handles simple keyboard shortcuts', () => {
    wrapper
      .find('Shortcuts')
      .instance()
      .handleKeyboard({ key: 'control', type: 'keydown' })

    wrapper
      .find('Shortcuts')
      .instance()
      .handleKeyboard({ key: 'c', type: 'keydown' })

    expect(handlers.onResponse).toHaveBeenCalledWith('copy', {
      delayOver: false,
      type: 'keydown'
    })
  })

  it('fires commands only once', () => {
    state().handleKeyboard({ key: 'control', type: 'keydown' })
    state().handleKeyboard({ key: 'c', type: 'keydown' })
    state().handleKeyboard({ key: 'c', type: 'keydown' })

    expect(handlers.onResponse).toHaveBeenCalledTimes(2)
  })

  it('does nothing when no modifiers are pressed', () => {
    state().handleKeyboard({ key: 'f', type: 'keydown' })
    expect(handlers.onResponse).toHaveBeenCalledWith(null)
  })

  it('clears released modifiers', () => {
    state().handleKeyboard({ key: 'control', type: 'keydown' })
    state().handleKeyboard({ key: 'meta', type: 'keydown' })
    state().handleKeyboard({ key: 'alt', type: 'keydown' })

    state().handleKeyboard({ key: 'control', type: 'keyup' })
    state().handleKeyboard({ key: 'meta', type: 'keyup' })
    state().handleKeyboard({ key: 'alt', type: 'keyup' })

    expect(state().getCurrentModifiers()).toHaveLength(0)
  })

  it('handles chorded shortcuts', () => {
    state().handleKeyboard({ key: 'control', type: 'keydown' })
    state().handleKeyboard({ key: 'g', type: 'keydown' })
    state().handleKeyboard({ key: 'f', type: 'keydown' })

    expect(handlers.onResponse).toHaveBeenCalledWith('submenu', {
      delayOver: false,
      type: 'keydown'
    })
  })

  it('handles chorded shortcuts with different modifiers', () => {
    state().handleKeyboard({ key: 'control', type: 'keydown' })
    state().handleKeyboard({ key: 'g', type: 'keydown' })
    state().handleKeyboard({ key: 'control', type: 'keyup' })
    state().handleKeyboard({ key: 'meta', type: 'keydown' })
    state().handleKeyboard({ key: 's', type: 'keydown' })

    expect(handlers.onResponse).toHaveBeenCalledWith('different submenu', {
      delayOver: false,
      type: 'keydown'
    })
  })

  it('handles multiple modifiers non-alphabetised', () => {
    state().handleKeyboard({ key: 'control', type: 'keydown' })
    state().handleKeyboard({ key: 'meta', type: 'keydown' })
    state().handleKeyboard({ key: 'z', type: 'keydown' })

    expect(handlers.onResponse).toHaveBeenCalledWith('undo', {
      delayOver: false,
      type: 'keydown'
    })
  })
  it('handles shifted keys', () => {
    state().handleKeyboard({ key: 'shift', type: 'keydown' })
    state().handleKeyboard({ key: 'meta', type: 'keydown' })
    state().handleKeyboard({ key: '?', type: 'keydown' })

    expect(handlers.onResponse).toHaveBeenCalledWith('show commands', {
      delayOver: false,
      type: 'keydown'
    })
  })

  it('clicks properly', () => {
    state().handleKeyboard({ key: 'control', type: 'click' })
    state().handleKeyboard({ key: 'c', type: 'click' })
    expect(handlers.onResponse).toHaveBeenCalledWith('copy', {
      delayOver: true,
      type: 'click'
    })
  })

  it('clicks toggle modifier', () => {
    expect(handlers.onModifiersChanged).not.toHaveBeenCalled()
    state().handleKeyboard({ key: 'shift', type: 'click' })
    expect(state().getCurrentModifiers().shift).toBeTruthy()
    expect(state().getCurrentModifiers()).toHaveLength(1)

    expect(handlers.onModifiersChanged).toHaveBeenCalled()
    state().handleKeyboard({ key: 'shift', type: 'click' })

    expect(state().getCurrentModifiers()).toHaveLength(0)
  })

  it('delays properly', done => {
    done.fail()
  })

  it('delays twice', done => {
    done.fail()
  })

  it('properly handles attach and detach', () => {
    let add = document.addEventListener
    let remove = document.removeEventListener

    document.addEventListener = jest.fn()
    document.removeEventListener = jest.fn()

    wrapper = mount(<Shortcuts store={createStore(reducer)} />)

    expect(document.addEventListener).toHaveBeenCalledWith(
      'keydown',
      expect.any(Function),
      expect.anything()
    )
    expect(document.addEventListener).toHaveBeenCalledWith(
      'keyup',
      expect.any(Function),
      expect.anything()
    )

    wrapper.unmount()

    expect(document.removeEventListener).toHaveBeenCalledWith(
      'keydown',
      expect.any(Function),
      expect.anything()
    )
    expect(document.removeEventListener).toHaveBeenCalledWith(
      'keyup',
      expect.any(Function),
      expect.anything()
    )

    document.addEventListener = add
    document.removeEventListener = remove
  })

  it('works end to end', () => {
    let map = {}

    let add = document.addEventListener
    let remove = document.removeEventListener

    document.addEventListener = jest
      .genMockFn()
      .mockImplementation((event, cb) => {
        map[event] = cb
      })
    document.removeEventListener = jest.fn()

    const onResponse = jest.fn()
    wrapper = mount(
      <Shortcuts
        store={createStore(reducer)}
        commandHierarchy={{
          control: {
            c: {
              command: 'copy'
            }
          }
        }}
        onResponse={onResponse}
      />
    )

    map['keydown']({ key: 'meta', type: 'keydown' })
    map['keyup']({ key: 'meta', type: 'keyup' })
    map['keydown']({ key: 'control', type: 'keydown' })
    map['keydown']({ key: 'c', type: 'keydown' })

    expect(onResponse).toHaveBeenCalledWith('copy', {
      delayOver: false,
      type: 'keydown'
    })

    document.addEventListener = add
    document.removeEventListener = remove
  })
})
