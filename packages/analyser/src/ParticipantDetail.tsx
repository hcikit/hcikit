import { Configuration, Log } from "@hcikit/workflow";
import {
  filter,
  find,
  groupBy,
  invert,
  mapValues,
  max,
  maxBy,
  min,
  minBy,
  sortBy,
} from "lodash";
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

let configs = {
  filled: {
    mark: {
      stroke: "#000000",
      strokeWidth: 2,
      fill: "#3976B1",
    },
    axisX: { grid: false },
    axisY: { grid: false },
  },
  thickFilled: {
    mark: {
      stroke: "#000000",
      strokeWidth: 5,
      fill: "#E3E3E3",
    },
    axisX: { grid: false },
    axisY: { grid: false },
  },
  normalStroke: {
    mark: {
      stroke: "#000000",
      fill: "#ffffff",
      strokeWidth: 2,
    },
    axisX: { grid: false },
    axisY: { grid: false },
  },
  noOutline: {
    mark: {
      stroke: "#000000",
      strokeWidth: 0,
      fill: "#E3E3E3",
    },
    axisX: { grid: false },
    axisY: { grid: false },
  },
};

export function configToName(config: string): string {
  let stringifyed = invert(
    mapValues(configs, (value, key) => JSON.stringify(value))
  );
  console.log(stringifyed);
  console.log(config);

  return stringifyed[config];
}

export function configToParsedLikelihoods(configuration: Configuration): any {
  let tasks = getAllTasks(configuration);
  let tasksGrouped = groupBy(tasks, "task");

  let notAttentionChecks = tasksGrouped["AskQuestionsGraph"].filter(
    ({ type }) => type !== "attention_check"
  );

  let likelihoods = notAttentionChecks.map((check) => ({
    ...check,
    ...find(check.logs, { type: "question_completed" }),
  }));

  let groupedByConfig = groupBy(likelihoods, ({ config }) =>
    JSON.stringify(config)
  );

  let parsedLikelihoods = [];
  for (let [config, logs] of Object.entries(groupedByConfig)) {
    let groupByDiff = groupBy(logs, ({ diff }) => Math.abs(diff as number));
    delete groupByDiff[0];

    for (let [absDiff, logs] of Object.entries(groupByDiff)) {
      let underBar = minBy(logs, "diff");
      let overBar = maxBy(logs, "diff");
      if (underBar && overBar) {
        // We want a positive number if they are more likely to choose something within that bar than outside of the bar.

        let likelihoodDiff =
          (underBar.diff as number) - (overBar.diff as number);

        parsedLikelihoods.push({
          absDiff,
          likelihoodDiff,
          ...overBar,
          configStr: configToName(config),
        });
      }
      // TODO: think out the above and what it actually means.
    }
  }

  return parsedLikelihoods;
}

const ParticipantDetail: React.FunctionComponent<{
  configuration: Configuration;
}> = ({ configuration }) => {
  let times = getAllTimes(configuration);
  let tasks = getAllTasks(configuration);
  let tasksGrouped = groupBy(tasks, "task");

  // TODO: find the attention check tasks
  let attentionChecks = filter(tasks, { type: "attention_check" });
  let attentionCheckLikelihoods = sortBy(
    attentionChecks.map((check) => ({
      ...check,
      ...find(check.logs, { type: "question_completed" }),
    })),
    "direction"
  );

  // TODO group by the graph and the amount of distance, then subtract the likelihoods.

  // arqueuro would be choice for this but idk how to integrate it into all of this so tooooo bad.

  // I can definitely imagine there's a nice way to work with all of the data,  but this is definitely not it.

  let parsedLikelihoods = configToParsedLikelihoods(configuration);
  // TODO: make the below chart, but for all participants.

  let likelihoodParsing = (
    <div>
      {
        <Graph
          spec={{
            data: {
              values: parsedLikelihoods,
            },
            mark: "bar",
            encoding: {
              y: { field: "likelihoodDiff", aggregate: "average" },
              x: { field: "configStr", type: "nominal" },
              color: { field: "configStr" },
            },
          }}
        />
        // For every bar, I want to know what the average difference in likelihood is.
      }
    </div>
  );

  // What is the data I want out of this?

  // [{likelihoodDiff : 5 (or -5)},diff : 3, spec : ]

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
          {attentionCheckLikelihoods.map(({ direction, likelihood }) => (
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
            values: parsedLikelihoods,
          },
          mark: "bar",
          encoding: {
            y: { field: "likelihoodDiff" },
            x: { field: "absDiff", type: "nominal" },
            column: { field: "configStr", type: "nominal" },
            color: { field: "absDiff" },
          },
        }}
      />
      {likelihoodParsing}
      {/* <Graph
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
      /> */}
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
