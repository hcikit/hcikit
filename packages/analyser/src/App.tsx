import React from "react";
import { ConfigurationsProvider, useConfigurations } from "./Configuration";
import { first } from "lodash";
import {
  getCurrentIndex,
  getTotalTasks,
  indexToTaskNumber,
} from "@hcikit/workflow";
function App() {
  return (
    <ConfigurationsProvider>
      <PercentCompleted />
    </ConfigurationsProvider>
  );
}

const PercentCompleted: React.FunctionComponent<{}> = () => {
  let configurations = useConfigurations();

  let totalTasks = getTotalTasks(configurations[0]);

  let completedness = configurations.map(
    (configuration) =>
      indexToTaskNumber(configuration, getCurrentIndex(configuration)) /
      totalTasks
  );

  return (
    <>
      {configurations.map((configuration) => (
        <pre>{JSON.stringify(configuration, null, 2)}</pre>
      ))}
    </>
  );
};

export default App;
