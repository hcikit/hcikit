import React, { Component, useEffect, useState } from "react";
import Experiment, {
  DOMEventLogger,
  Fitts,
  ConsentForm,
  InformationScreen,
} from "@hcikit/react";


/**
 * 
 * I can just flatten down to the log level rather than the children level, that solves a bunch of problems.
 * That let's us do the data analysis with different fields and stuff. 
 * 
 * How to get calculated values like subtractions.
 * 
 * 
 */

// import configuration from "./configuration";
import configuration from "./fitts-configuration";

// import ConfigUnroller from "./ConfigUnroller";
import Replayer from "./Replayer";
import log from "./log";
import ReplayGrid from "./ReplayGrid";
import { getConfigAtIndex } from "@hcikit/workflow";

let tasks = {
  DOMEventLogger: () => null,
  Fitts,
  ConsentForm,
  InformationScreen,
};

let firstTime = log.children[0].children[0].logs[0].timestamp;

console.log(firstTime);

let startTime = Date.now();

let logs = [log, log, log, log];

let transformTime = (t) => {
  return t - (startTime - firstTime);
};

const App = () => {
  let transformations = [];

  logs = logs.map((log) =>
    transformations.reduce((prev, filter) => filter(prev), log)
  );

  return (
    <>
      <WorkflowIndex onChange={() => {}} />
      <BreakOutTasks onChange={() => {}} />
    </>
    // <Experiment tasks={tasks} configuration={configuration} />
    // <ReplayGrid
    //   tasks={tasks}
    //   logs={[log, log, log, log]}
    //   index={[0, 0]}
    //   transformTime={transformTime}
    // ></ReplayGrid>
  );
};

const BreakOutTasks = ({ onChange }) => {
  const [breakoutTasksEnabled, setBreakoutTasksEnabled] = useState(false);
  useEffect(() => {
    onChange((log) => {
      
    });
  }, [onChange, breakoutTasksEnabled]);

  return (
    <input
      type="check"
      onChange={(e) => setBreakoutTasksEnabled(e.target.value)}
    />
  );
};

// TODO: I can imagine this having a depth parameter, similar to another component I forget whcih, maybe a progress bar.
// THe way it works is rather than aggregating tasks, instead it aggregates upwards
const WorkflowIndex = ({ onChange }) => {
  const [workflowIndex, setWorkflowIndex] = useState("");
  useEffect(() => {
    onChange((log) => 
      getConfigAtIndex(
        workflowIndex.split(",").map(parseInt).filter(Boolean),
        log
      );
    );
  }, [onChange, workflowIndex]);

  return (
    <input type="text" onChange={(e) => setWorkflowIndex(e.target.value)} />
  );
};

export default App;
