import { throttle, pick } from "lodash";
import { useEffect } from "react";
// import PropTypes from "prop-types";
import { useExperiment } from "../core/Experiment";

// TODO: add more events like touch, page refreshes mousewheel scroll resize
// TODO: need something better than "target", a unique identifier or something maybe? https://github.com/ericclemmons/unique-selector/

// TODO: maybe the eventMapping can take an object that just logs whatever you want to it?

// TODO: doesn't work if you need to scroll...
const defaults = ["type"];

const mouseEvents = [
  "clientX",
  "clientY",
  "screenX",
  "screenY",
  "pageX",
  "pageY",
  ...defaults,
];

const keyboardEvents = [
  "key",
  "code",
  "metaKey",
  "shiftKey",
  "altKey",
  "ctrlKey",
  ...defaults,
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

  // resize: resizeEventHandler,
};

// function resizeEventHandler({ type }: UIEvent) {
//   return {
//     type,
//     clientHeight: document.body.clientHeight,
//     clientWidth: document.body.clientWidth,
//     screenWidth: window.screen.width,
//     screenHeight: window.screen.height,
//   };
// }
// TODO: this is fine for pulling some stuff out of the event but maybe not fine if you ened to aughment it
const DOMEventLogger: React.FunctionComponent<{
  delay?: number;
  events?: Array<keyof WindowEventMap>;
  eventMapping?: Record<keyof WindowEventMap, Array<string>>;
}> = ({
  delay = 200,
  events = ["click", "mousemove", "keydown", "keyup", "keypress", "resize"],
  eventMapping = defaultEventMapping,
}) => {
  const { log } = useExperiment();

  useEffect(() => {
    const logEvent = (event: Event) => {
      // if (typeof eventMapping[event.type] === "function") {
      //   event = eventMapping[event.type]();
      // } else {

      let keys = (eventMapping as Record<string, Array<string>>)[event.type];
      let neededProps = pick(event, keys);
      // }
      log({ ...neededProps, type: "DOMEvent" });
    };

    let allEvents = events;

    if (!allEvents) {
      allEvents = Object.keys(eventMapping) as Array<keyof WindowEventMap>;
    }

    const listeners = allEvents.reduce<
      Record<keyof WindowEventMap, EventListener>
    >((listeners, event) => {
      // TODO: log original size.
      // TODO: this really needs a flush call I think. It is unlikely to cause problems but it could. I could just flush in a useEffect return value
      // TODO: what happens if this gets called after the task is over? Maybe we need to be able to sign up for events before changing to the next task?
      const func = throttle(logEvent, delay, {
        trailing: true,
      });

      // log({ type: "initialSize" });

      window.addEventListener(event, func, {
        passive: true,
        capture: true,
      });

      listeners[event] = func;

      return listeners;
    }, {} as Record<keyof WindowEventMap, EventListener>);

    return () => {
      Object.keys(listeners).forEach((event) => {
        window.removeEventListener(
          event as keyof WindowEventMap,
          listeners[event as keyof WindowEventMap]
        );
      });
    };
  });
  // }, [eventMapping, delay, events]);

  return null;
};

// DOMEventLogger.propTypes = {
//   /** How often events should be logged */
//   delay: PropTypes.number,

//   /** A list of events to listen for globally. If both events and eventMapping are passed then events are used as a subset of the entire eventMapping. */
//   events: PropTypes.arrayOf(PropTypes.string.isRequired),

//   /** an object where the keys are the event to watch, and the values are the properties from each event to keep. If both events and eventMapping are passed then events are used as a subset of the entire eventMapping. */
//   eventMapping: PropTypes.objectOf(
//     PropTypes.arrayOf(PropTypes.string.isRequired)
//   ),
// };

export default DOMEventLogger;
