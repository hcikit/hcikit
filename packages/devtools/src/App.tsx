import {
  ConfigMutatorContext,
  ConfigContext,
  useConfiguration,
  useExperiment,
  ControlFunctions,
  HCIKIT_DEVTOOLS_PORT,
  Message,
} from "@hcikit/react";
import { Configuration, __INDEX__ } from "@hcikit/workflow";
import { useEffect, useState } from "react";
import { configStream, sendAdvance } from "./messages";

function App() {
  const [config, setConfig] = useState<Configuration>();
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
      if (message.type === "configuration") {
        setConfig(message.configuration);
      }
    }

    port.onDisconnect.addListener(handleDisconnect);
    port.onMessage.addListener(handleMessage);

    return () => {
      port.onDisconnect.removeListener(handleDisconnect);
    };
  }, [port]);

  return (
    <ConfigMutatorContext.Provider
      value={
        {
          advance: (index) =>
            port.postMessage({ type: "advance", index } as Message),
          // TODO:
          modify: (index, value) => {},
          log: (log) => {},
        } as ControlFunctions
      }
    >
      <ConfigContext.Provider value={config}>
        <div className="text-lg font-bold">App</div>
        {config?.__INDEX__}
      </ConfigContext.Provider>
    </ConfigMutatorContext.Provider>
  );
}

export default App;
