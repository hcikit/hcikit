import { TaskRenderer } from "@hcikit/react";
import React, { useEffect, useState, useRef } from "react";
import {
  configureStore,
  setWorkflowIndex,
  getConfigAtIndex,
  __INDEX__
} from "@hcikit/workflow";
import { Provider } from "react-redux";
import styled from "styled-components";

const Mouse = styled.div`
  position: relative;
  width: 10px;
  height: 10px;
  background-color: black;
  left: ${({ x }) => x}px;
  top: ${({ y }) => y}px;
`;

export default ({ log, index, tasks, transformTime, onReplayComplete }) => {
  let [mouse, setMouse] = useState({ x: 100, y: 100 });
  let [store, setStore] = useState(null);

  let tick = useRef(null);
  let lastExecutedTimestamp = useRef(0);

  let ticks = useRef(0);

  useEffect(() => {
    // This is breaking because we log inside of configure store. I think maybe we should be doing that inside of the experiment instead. This gives the user more control?
    // store.current.dispatch(setWorkflowIndex(index));

    log[__INDEX__] = index;

    function readyToPlayButNotPlayed({ timestamp }) {
      // console.log(
      //   transformTime(Date.now()) > timestamp &&
      //     lastExecutedTimestamp.current < timestamp,
      //   transformTime(Date.now()) > timestamp,
      //   lastExecutedTimestamp.current < timestamp,
      //   transformTime(Date.now()),
      //   timestamp,
      //   lastExecutedTimestamp.current
      // );

      return (
        transformTime(Date.now()) > timestamp &&
        lastExecutedTimestamp.current < timestamp
      );
    }

    // TODO: Maybe deep copy the log first? Technically it shouldn't modify it t all.

    setStore(configureStore(log));

    console.log(log);

    tick.current = () => {
      if (ticks.current > 100) {
        return;
      }

      let logs = getConfigAtIndex(index, log).logs;

      let eventsToPlay = logs.filter(readyToPlayButNotPlayed);

      eventsToPlay.forEach(event => {
        switch (event.type) {
          case "mousemove":
            console.log("moving");
            setMouse({ x: event.pageX, y: event.pageY });
            break;
          case "click":
            console.log("clicked");
            break;
          default:
            return;
        }
      });

      lastExecutedTimestamp.current = transformTime(Date.now());

      // TODO: fire replay complete if we see a taskcomplete event.

      ticks.current++;

      requestAnimationFrame(tick.current);
    };

    requestAnimationFrame(tick.current);
  }, [index, log, transformTime]);

  if (!store) {
    return null;
  }

  // TODO: set these widths properly.
  return (
    <div style={{ width: 800, height: 800 }}>
      <Provider store={store}>
        <Mouse {...mouse} />
        <TaskRenderer tasks={tasks} configuration={log}></TaskRenderer>
      </Provider>
    </div>
  );
};
