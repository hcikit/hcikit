import { mount } from 'enzyme'
import React from 'react'
import { ConnectedStimulusResponse as StimulusResponse } from './StimulusResponse'
import { Provider } from 'react-redux'
import { createStore, combineReducers } from 'redux'
import reducer from './StimulusResponse.reducers'

describe('StimulusResponse', () => {
  let mocks = {
    onLog: jest.fn(),
    onAdvanceWorkflow: jest.fn()
  }

  let setTimeoutCalledWith = []
  const tm = window.setTimeout

  function createWrapper(props = {}) {
    window.setTimeout = jest.genMockFn().mockImplementation((cb, time) => {
      setTimeoutCalledWith.push(cb)
    })

    mocks = {
      onLog: jest.fn(),
      onAdvanceWorkflow: jest.fn()
    }

    const store = createStore(combineReducers({ StimulusResponse: reducer }))

    return mount(
      <Provider store={store}>
        <StimulusResponse
          {...mocks}
          {...props}
          stimulus={'world'}
          menuItems={['hello', 'world']}
          responseInput={'Buttons'}
        />
      </Provider>
    )
  }

  afterEach(() => {
    window.setTimeout = tm
  })

  it('default incorrect', () => {
    const wrapper = createWrapper()
    wrapper
      .find('#hello')
      .first()
      .simulate('click')

    expect(wrapper.find('ScreenFlash')).toHaveLength(0)
    expect(window.setTimeout).not.toHaveBeenCalled()
    expect(mocks.onAdvanceWorkflow).toHaveBeenCalled()
  })

  it('default correct', () => {
    const wrapper = createWrapper()

    wrapper
      .find('#world')
      .first()
      .simulate('click')

    expect(wrapper.find('ScreenFlash')).toHaveLength(0)
    expect(window.setTimeout).not.toHaveBeenCalled()
    expect(mocks.onAdvanceWorkflow).toHaveBeenCalled()
  })

  it('delay correct', () => {
    const wrapper = createWrapper({ delayOnError: 1000 })

    wrapper
      .find('#world')
      .first()
      .simulate('click')

    expect(wrapper.find('ScreenFlash')).toHaveLength(0)
    expect(window.setTimeout).not.toHaveBeenCalled()
    expect(mocks.onAdvanceWorkflow).toHaveBeenCalled()
  })

  it('delays on error', () => {
    const mocked = Date.now
    Date.now = jest.fn(() => 0)

    const wrapper = createWrapper({ delayOnError: 1000 })

    wrapper
      .find('#hello')
      .first()
      .simulate('click')

    expect(wrapper.find('ScreenFlash')).toHaveLength(0)
    expect(window.setTimeout).toHaveBeenCalledWith(expect.anything(), 1000)
    expect(mocks.onAdvanceWorkflow).not.toHaveBeenCalled()

    expect(wrapper.find('h1')).toHaveLength(1)
    expect(wrapper.find('h1').text()).toEqual('Incorrect')

    Date.now = jest.fn(() => 1011)

    setTimeoutCalledWith[0]()
    wrapper.update()

    expect(mocks.onAdvanceWorkflow).toHaveBeenCalled()
    expect(wrapper.find('h1')).toHaveLength(0)
    global.Date.now = mocked
  })

  it('flashes on error', () => {
    const wrapper = createWrapper({ flashOnError: true, delayOnError: 1000 })

    expect(wrapper.find('ScreenFlash')).toHaveLength(1)

    let times = wrapper
      .find('ScreenFlash')
      .first()
      .prop('times')

    wrapper
      .find('#hello')
      .first()
      .simulate('click')

    expect(
      wrapper
        .find('ScreenFlash')
        .first()
        .prop('times')
    ).not.toEqual(times)

    setTimeoutCalledWith[0]()
    wrapper.update()

    expect(mocks.onAdvanceWorkflow).not.toHaveBeenCalled()
  })

  it('doesnt flash on success', () => {
    const wrapper = createWrapper({ flashOnError: true })

    expect(wrapper.find('ScreenFlash')).toHaveLength(1)

    let times = wrapper
      .find('ScreenFlash')
      .first()
      .prop('times')

    wrapper
      .find('#world')
      .first()
      .simulate('click')

    expect(
      wrapper
        .find('ScreenFlash')
        .first()
        .prop('times')
    ).toEqual(times)

    expect(mocks.onAdvanceWorkflow).toHaveBeenCalled()
  })
})
