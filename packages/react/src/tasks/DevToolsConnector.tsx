import { useEffect, useState } from "react";
import { FunctionTask, useConfiguration, useExperiment } from "../index.js";
import { Configuration, ExperimentIndex } from "@hcikit/workflow";

export const HCIKIT_DEVTOOLS_PORT = "hcikit-devtools-port";

export type Message =
  | { type: "advance"; index?: ExperimentIndex }
  | { type: "configuration"; configuration: Configuration };

export let DevToolsConnector: FunctionTask = () => {
  const experiment = useExperiment();
  const configuration = useConfiguration();

  const [port, setPort] = useState(
    chrome.runtime.connect({ name: HCIKIT_DEVTOOLS_PORT })
  );

  useEffect(() => {
    const handleDisconnect = () => {
      console.error("Disconnected from devtools.");
      setPort(chrome.runtime.connect({ name: HCIKIT_DEVTOOLS_PORT }));
    };

    function handleMessage(message: Message) {
      console.log(message);
      if (message.type === "advance") {
        experiment.advance(message.index);
      }
    }

    port.onDisconnect.addListener(handleDisconnect);
    port.onMessage.addListener(handleMessage);

    return () => {
      port.onDisconnect.removeListener(handleDisconnect);
    };
  }, [port, experiment]);

  useEffect(() => {
    console.log("Sending config");
    // TODO: throttle maybe? Could also send differences rather than the whole thing but nah.
    port.postMessage({ type: "configuration", configuration });
  }, [configuration, port]);
  return null;
};
