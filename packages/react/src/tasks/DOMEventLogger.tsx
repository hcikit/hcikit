import { throttle, pick } from "lodash-es";
import { useEffect } from "react";
import { useExperiment } from "../core/Experiment.js";

/**
 * TODO:
 * add more events like touch, page refreshes mousewheel scroll resize
 * need something better than "target", a unique identifier or something maybe? https://github.com/ericclemmons/unique-selector/
 * maybe the eventMapping can take an object that just logs whatever you want to it?
 * doesn't work if you need to scroll...
 */
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
// TODO: this is fine for pulling some stuff out of the event but maybe not fine if you need to augment it

const DOMEventLogger: React.FunctionComponent<{
  fps?: number;
  events?: Array<keyof WindowEventMap>;
  eventMapping?: Record<keyof WindowEventMap, Array<string>>;
}> = ({
  fps = 30,
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
      // @ts-ignore
      neededProps.eventType = neededProps.type;
      // }
      log({ ...neededProps, type: "DOMEvent" });
    };

    let allEvents = events;

    if (!allEvents) {
      allEvents = Object.keys(eventMapping) as Array<keyof WindowEventMap>;
    }

    let listeners: Record<string, EventListener> = {};
    const options: AddEventListenerOptions = {
      passive: true,
      capture: true,
    };

    for (let event of allEvents) {
      const func = throttle(logEvent, 1000 / fps, {
        trailing: true,
      });

      window.addEventListener(event, func, options);

      listeners[event] = func;
    }

    return () => {
      Object.keys(listeners).forEach((event) => {
        window.removeEventListener(event, listeners[event], options);
      });
    };
  }, [eventMapping, fps, events, log]);
  // }, [eventMapping, delay, events]);

  return null;
};

export default DOMEventLogger;
