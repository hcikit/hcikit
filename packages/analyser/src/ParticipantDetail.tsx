import { Configuration, Log } from "@hcikit/workflow";
import { groupBy } from "lodash";
import { Link } from "react-router-dom";
import { Metrics, TileMetrics } from "./components/Tile";
import {
  getLogs,
  getTimeTaken,
  getTimeTakenForLogs,
  millisecondsToMinutes,
  millisecondsToSeconds,
} from "./logAnalysis";

// TODO: split out all of the tasks.

const participantMetrics: Metrics<Configuration> = {
  timeTaken: {
    unit: "minutes",
    calculator: (configuration) =>
      // TODO: this won't work because there are trials in an array of logs.
      millisecondsToMinutes(getTimeTaken(configuration)),
  },
};

const ParticipantDetail: React.FunctionComponent<{
  configuration: Configuration;
}> = ({ configuration }) => {
  let logs = getLogs(configuration);
  let logsByTask = groupBy(logs, "task");

  return (
    <div className="mb-10">
      <h2>
        <span className="text-sm text-gray-400 italic">participant:</span>
        <span className="text-lg text-gray-700 font-bold">
          <Link to={`/raw/${configuration.participant}`}>
            {(configuration.participant as string) || ""}
          </Link>
        </span>
      </h2>
      <TileMetrics metrics={participantMetrics} value={configuration} />
      <div className="mb-2">
        {Object.entries(logsByTask).map(([task, logs]) => (
          <ParticipantTask logs={logs} task={task} />
        ))}
      </div>
    </div>
  );
};

const taskMetrics: Metrics<Array<Log>> = {
  timeTaken: {
    unit: "seconds",
    calculator: (logs: Array<Log>) =>
      millisecondsToSeconds(getTimeTakenForLogs(logs)),
  },
};

const ParticipantTask: React.FunctionComponent<{
  logs: Array<Log>;
  task: string;
}> = ({ logs, task }) => {
  return (
    <div className="mb-2">
      <h3 className="text-md text-gray-600 italic mb-1">{task}</h3>
      <TileMetrics metrics={taskMetrics} value={logs} />
    </div>
  );
};

export default ParticipantDetail;
