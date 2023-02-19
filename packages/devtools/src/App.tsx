import {
  ConfigMutatorContext,
  ConfigContext,
  useConfiguration,
  useExperiment,
  ControlFunctions,
} from "@hcikit/react";
import { Configuration, __INDEX__ } from "@hcikit/workflow";
import { useEffect, useState } from "react";
import { configStream, sendAdvance } from "./messages";

function App() {
  const [config, setConfig] = useState<Configuration | undefined>(
    window.__HCIKIT_DEVTOOLS_EXTENSION__.getConfig()
  );

  useEffect(() => {
    const configSubscription = configStream.subscribe((config) => {
      setConfig(config[0]);
    });

    return () => {
      configSubscription.unsubscribe();
    };
  }, []);

  console.log("hello");

  return (
    <ConfigMutatorContext.Provider
      value={{
        advance: (index) => sendAdvance({ index }),
        // TODO:
        modify: (index, value) => {},
        log: (log) => {},
      }}
    >
      <ConfigContext.Provider value={config}>
        <div className="text-lg font-bold">App</div>
        {config?.__INDEX__}
      </ConfigContext.Provider>
    </ConfigMutatorContext.Provider>
  );
}

export default App;
