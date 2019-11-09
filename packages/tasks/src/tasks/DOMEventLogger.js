import { throttle, pick } from "lodash-es";
import { useEffect } from "react";
import PropTypes from "prop-types";

// TODO: add more events like touch, page refreshes mousewheel scroll resize
// TODO: need something better than "target", a unique identifier or something maybe? https://github.com/ericclemmons/unique-selector/

// TODO: maybe the eventMapping can take an object that just logs whatever you want to it?

// TODO: doesn't work if you need to scroll...
const defaults = ["type"];

function resizeEventHandler({ type }) {
  return {
    type,
    clientHeight: document.body.clientHeight,
    clientWidth: document.body.clientWidth,
    screenWidth: window.screen.width,
    screenHeight: window.screen.height
  };
}

const mouseEvents = [
  "clientX",
  "clientY",
  "screenX",
  "screenY",
  "pageX",
  "pageY",
  ...defaults
];

const keyboardEvents = [
  "key",
  "code",
  "metaKey",
  "shiftKey",
  "altKey",
  "ctrlKey",
  ...defaults
];

const defaultEventMapping = {
  mousedown: mouseEvents,
  mouseup: mouseEvents,
  click: mouseEvents,
  dblclick: mouseEvents,
  mousemove: mouseEvents,
  mouseover: mouseEvents,
  mouseout: mouseEvents,

  keydown: keyboardEvents,
  keyup: keyboardEvents,
  keypress: keyboardEvents,

  resize: resizeEventHandler
};

// TODO: this is fine for pulling some stuff out of the event but maybe not fine if you ened to aughment it
const DOMEventLogger = ({
  log,
  delay = 200,
  events = ["click", "mousemove", "keydown", "keyup", "keypress", "resize"],
  eventMapping = defaultEventMapping
}) => {
  useEffect(() => {
    const logEvent = (log, event) => {
      // if (typeof eventMapping[event.type] === "function") {
      //   event = eventMapping[event.type]();
      // } else {
      event = pick(event, eventMapping[event.type]);
      // }
      log(event);
    };

    let allEvents = events;

    if (!allEvents) {
      allEvents = Object.keys(eventMapping);
    }

    let listeners = allEvents.reduce((listeners, event) => {
      // TODO: log original size.
      // TODO: this really needs a flush call I think. It is unlikely to cause problems but it could.
      // TODO: what happens if this gets called after the task is over? Maybe we need to be able to sign up for events before changing to the next task?
      let func = throttle(logEvent.bind(null, log), delay, { trailing: true });

      // log({ type: "initialSize" });

      window.addEventListener(event, func, {
        passive: true,
        capture: true
      });

      listeners[event] = func;

      return listeners;
    }, {});

    return () => {
      Object.keys(listeners).forEach(event => {
        window.removeEventListener(event, listeners[event], {
          passive: true,
          capture: true
        });
      });
    };
  });
  // }, [eventMapping, delay, events]);

  return null;
};

DOMEventLogger.propTypes = {
  /** How often events should be logged */
  delay: PropTypes.number,

  /** A list of events to listen for globally. If both events and eventMapping are passed then events are used as a subset of the entire eventMapping. */
  events: PropTypes.arrayOf(PropTypes.string),

  /** an object where the keys are the event to watch, and the values are the properties from each event to keep. If both events and eventMapping are passed then events are used as a subset of the entire eventMapping. */
  eventMapping: PropTypes.objectOf(PropTypes.arrayOf(PropTypes.string)),

  /** @ignore */
  log: PropTypes.any
};

export default DOMEventLogger;
