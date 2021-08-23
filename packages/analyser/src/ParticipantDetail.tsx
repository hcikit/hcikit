import { Configuration, Log } from "@hcikit/workflow";
import { filter, find, groupBy, sortBy } from "lodash";
import { Link } from "react-router-dom";
import Graph from "./components/Graph";
import { Metrics, TileMetrics } from "./components/Tile";
import {
  getAllTasks,
  getAllTimes,
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
  let times = getAllTimes(configuration);
  let tasks = getAllTasks(configuration);
  let tasksGrouped = groupBy(tasks, "task");

  // TODO: find the attention check tasks
  let attentionChecks = filter(tasks, { type: "attention_check" });
  let likelihoods = sortBy(
    attentionChecks.map((check) => ({
      ...check,
      ...find(check.logs, { type: "question_completed" }),
    })),
    "direction"
  );

  return (
    <div className="mb-10">
      <h2>
        <span className="text-sm text-gray-400 italic">participant: </span>
        <span className="text-lg text-gray-700 font-bold">
          <Link to={`/raw/${configuration.participant}`}>
            {(configuration.participant as string) || ""}
          </Link>
        </span>
      </h2>
      <h2>
        <div>
          {/* <h3 className="text-lg">Attention Check</h3> */}

          {likelihoods.map(({ direction, likelihood }) => (
            <div>
              <span className="text-sm  text-gray-400 italic">
                {direction as string}
              </span>
              :{" "}
              <span
                className={`${
                  validateAttentionCheck(
                    direction as "left" | "right",
                    likelihood as number
                  )
                    ? "text-green-700"
                    : "text-red-700 text-xl font-bold"
                }`}
              >
                {likelihood as string}
              </span>
            </div>
          ))}
        </div>
      </h2>
      <TileMetrics metrics={participantMetrics} value={configuration} />
      <Graph
        spec={{
          data: {
            values: times,
          },
          mark: "bar",
          encoding: {
            y: { field: "participant" },
            x: { aggregate: "sum", field: "timeTaken" },
            color: { field: "task" },
          },
        }}
      />
      {/* <div className="mb-2">
        {Object.entries(logsByTask).map(([task, logs]) => (
          <ParticipantTask logs={logs} task={task} />
        ))}
      </div> */}
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

function validateAttentionCheck(
  direction: "left" | "right",
  likelihood: number
): boolean {
  if (direction === "left") {
    return likelihood <= 10;
  } else {
    return likelihood >= 90;
  }
}

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
