import React from 'react'
import ReactDOM from 'react-dom'
import { KeyMap } from './KeyMap'

xit('renders without crashing', () => {
  const div = document.createElement('div')
  ReactDOM.render(<KeyMap />, div)
  ReactDOM.unmountComponentAtNode(div)
})
