import { Configuration, Log } from "@hcikit/workflow";
import { filter, groupBy } from "lodash";
import { Link } from "react-router-dom";
import { PlainObject, VegaLite, VisualizationSpec } from "react-vega";
import { Config } from "vega";
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

  let configs = groupBy(logsByTask["AskQuestionsGraph"], ({ config }) =>
    JSON.stringify(config)
  );

  for (let [config, logs] of Object.entries(configs)) {
    let likelihoods = filter(logs, { type: "question_completed" });
    likelihoods = filter(logs, { point: 0 });

    // TODO: group by the point and throw away the zero.
    groupBy(likelihoods, "point");
  }

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
      {Object.entries(configs).map(([config, logs]) => (
        <VegaLite
          actions={false}
          config={logs[0].config as Config}
          data={logs[0].data as PlainObject}
          spec={logs[0].spec as VisualizationSpec}
        />
      ))}

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
