import { throttle, pick } from 'lodash'
window.addEventListener('mousemove', e => {
  window.mousex = e.clientX
  window.mousey = e.clientY
})

let events =
  'mousedown mouseup click dblclick mousemove mouseover mouseout keydown keyup keypress resize'
events.split(' ').forEach(event => {
  window.addEventListener(event, throttle(event => logEvent(event), 200), {
    passive: true
  })
})

const LOG_KEY = 'log_key'

let loaded = window.localStorage.getItem(LOG_KEY)
if (loaded) {
  window.log = JSON.parse(loaded)
} else {
  window.log = []
}

const logEvent = event => {
  window.log.push(transformEvent(event))
  saveState()
}

const saveState = throttle(() => {
  window.localStorage.setItem(LOG_KEY, JSON.stringify(window.log))
}, 5000)

// mousewheel scroll resize
// TODO: add touch events here too.
// TODO: this doesn't work right now.
// TODO: this shouldn't be here and should actually be a component added all the time, then you can dynamically control the throttlerate and what events are used with config.
const transformEvent = event => {
  switch (event.type) {
    case 'mousedown':
    case 'mouseup':
    case 'click':
    case 'dblclick':
    case 'mousemove':
    case 'mouseover':
    case 'mouseout':
      event = pick(event, [
        'type',
        'clientX',
        'clientY',
        'screenX',
        'screenY',
        'pageX',
        'pageY'
      ])
      break
    case 'keydown':
    case 'keyup':
    case 'keypress':
      event = pick(event, [
        'type',
        'key',
        'code',
        'metaKey',
        'shiftKey',
        'altKey',
        'ctrlKey'
      ])
      break
    case 'resize':
      event = {
        width: Math.max(
          document.documentElement.clientWidth,
          window.innerWidth || 0
        ),
        height: Math.max(
          document.documentElement.clientHeight,
          window.innerHeight || 0
        )
      }
      break
    default:
      return {}
  }
}
