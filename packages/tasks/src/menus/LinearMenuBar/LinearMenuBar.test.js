import React from 'react'
import LinearMenuBar, { ExposeHK } from './LinearMenuBar'
import { mount } from 'enzyme'
import { createStore } from 'redux'
import reducer from '../../reducers'
import { Provider } from 'react-redux'

let wrapper
let handlers = {}
const nativeEvent = { nativeEvent: { stopImmediatePropagation: () => {} } }

let menus = [
  {
    title: 'Animals',
    items: [
      { command: 'dog', shortcut: [['control', 'alt', 'd']] },
      { command: 'cat', shortcut: [['control', 'c']] },
      { command: 'pig', shortcut: [['control', 'p']] },
      { command: 'bird', shortcut: [['control', 'b']] }
    ]
  },
  {
    title: 'Fruits',
    items: [
      { command: 'pineapple', shortcut: [['control', 'meta', 'p']] },
      { command: 'apple', shortcut: [['meta', 'shift', 'k']] },
      { command: 'kiwi', shortcut: [['alt', 'k']] },
      { command: 'potato', shortcut: [['control', 'shift', 'p']] }
    ]
  }
]

function createWrapper() {
  handlers = { onResponse: jest.fn() }
  const store = createStore(reducer)
  return mount(
    <Provider store={store}>
      <LinearMenuBar onResponse={handlers.onResponse} menus={menus} />
    </Provider>
  )
}

describe('LinearMenuBar', () => {
  beforeEach(() => {
    wrapper = createWrapper()
  })
  it('opens a menu when clicking title', () => {
    wrapper
      .find("[title='Animals']")
      .find('.title')
      .first()
      .simulate('click', nativeEvent)

    expect(wrapper.find("[title='Animals']").prop('open')).toBeTruthy()

    expect(wrapper.find('.active')).toHaveLength(1)
  })
  it('opens a different menu when hovering', () => {
    wrapper
      .find("[title='Animals']")
      .find('.title')
      .first()
      .simulate('click', nativeEvent)
    expect(wrapper.find('.active')).toHaveLength(1)
    expect(wrapper.find("[title='Animals']").prop('open')).toBeTruthy()

    wrapper
      .find("[title='Fruits']")
      .first()
      .simulate('mouseenter', nativeEvent)

    expect(wrapper.find(`[title="Animals"]`).prop('open')).toBeFalsy()
    expect(wrapper.find(`[title="Fruits"]`).prop('open')).toBeTruthy()
    expect(wrapper.find('[open=true]')).toHaveLength(1)
  })
  it('doesnt opn a menu when just hovering', () => {
    wrapper
      .find('.title')
      .first()
      .simulate('mouseenter', nativeEvent)
    expect(wrapper.find('.active')).toHaveLength(0)
    expect(wrapper.find('[open=true]')).toHaveLength(0)
  })
  it('closes when clicking again', () => {
    wrapper
      .find("[title='Animals']")
      .find('.title')
      .first()
      .simulate('click', nativeEvent)
    wrapper
      .find("[title='Animals']")
      .find('.title')
      .first()
      .simulate('click', nativeEvent)

    expect(wrapper.find("[title='Animals']").prop('open')).toBeFalsy()
    expect(wrapper.find('[open=true]')).toHaveLength(0)
  })
  it('closes when clicking document', () => {
    const map = {}

    let patch = document.addEventListener
    document.addEventListener = jest.fn((event, cb) => {
      map[event] = cb
    })

    wrapper = createWrapper()
    wrapper
      .find("[title='Animals']")
      .find('.title')
      .first()
      .simulate('click', nativeEvent)

    map.click({})
    wrapper.update()

    expect(wrapper.find('[open=true]')).toHaveLength(0)

    document.addEventListener = patch
  })

  it('calls onResponse', () => {
    wrapper
      .find("[title='Animals']")
      .find('.title')
      .first()
      .simulate('click', nativeEvent)
    wrapper.find("[command='dog']").simulate('click', nativeEvent)

    expect(handlers.onResponse).toHaveBeenCalledWith('dog', {
      delayOver: true,
      type: 'click'
    })
  })
  it('calls onResponse for shortcut', () => {
    const map = {}

    let patch = document.addEventListener
    document.addEventListener = jest.fn((event, cb) => {
      map[event] = cb
    })

    wrapper = createWrapper()

    map.keydown({ key: 'control', type: 'keydown' })
    map.keydown({ key: 'c', type: 'keydown' })

    wrapper.update()

    expect(wrapper.find('[open=true]')).toHaveLength(0)
    expect(handlers.onResponse).toHaveBeenCalledWith('cat', {
      delayOver: false,
      type: 'keydown'
    })

    document.addEventListener = patch
  })

  it('removes all events properly', () => {
    const map = {}

    let patch = document.addEventListener
    document.addEventListener = jest.fn((event, cb) => {
      map[event] = cb
    })

    let patchR = document.removeEventListener
    document.removeEventListener = jest.fn()

    wrapper = createWrapper()

    wrapper.unmount()

    expect(document.removeEventListener).toHaveBeenCalledWith(
      'click',
      map['click']
    )

    document.addEventListener = patch
    document.removeEventListener = patchR
  })
})

describe('ExposeHK', () => {
  let setTimeoutCalledWith = []
  const tm = window.setTimeout
  const patch = document.addEventListener

  let map = {}

  function createWrapper() {
    handlers = { onResponse: jest.fn() }

    const store = createStore(reducer)
    return mount(
      <Provider store={store}>
        <ExposeHK onResponse={handlers.onResponse} menus={menus} />
      </Provider>
    )
  }

  beforeEach(() => {
    document.addEventListener = jest.fn((event, cb) => {
      map[event] = cb
    })
    window.setTimeout = jest.genMockFn().mockImplementation((cb, time) => {
      setTimeoutCalledWith.push(cb)
    })
    setTimeoutCalledWith = []
  })

  afterEach(() => {
    global.setTimeout = tm
    document.addEventListener = patch
  })

  it('pressing a modifier opens ExposeHK', () => {
    const wrapper = createWrapper()
    wrapper.update()

    map.keydown({ key: 'control', type: 'keydown' })
    setTimeoutCalledWith[0]()
    wrapper.update()

    expect(wrapper.find('[open=true]')).toHaveLength(2)

    map.keydown({ key: 'c', type: 'keydown' })
    wrapper.update()

    expect(wrapper.find('[open=true]')).toHaveLength(0)

    expect(handlers.onResponse).toHaveBeenCalledWith('cat', {
      delayOver: true,
      type: 'keydown'
    })
  })

  it('releasing a modifier closes ExposeHK', () => {
    const wrapper = createWrapper()
    wrapper.update()

    map.keydown({ key: 'control', type: 'keydown' })
    setTimeoutCalledWith[0]()
    wrapper.update()

    expect(wrapper.find('[open=true]')).toHaveLength(2)

    map.keyup({ key: 'control', type: 'keyup' })
    wrapper.update()

    expect(wrapper.find('[open=true]')).toHaveLength(0)
  })
})
