import {
  Configuration,
  experimentComplete,
  getCurrentIndex,
  getTotalTasks,
  indexToTaskNumber,
  randomString,
} from "@hcikit/workflow";
import Graph, { Histogram } from "./components/Graph";
import { Metrics, TileMetrics } from "./components/Tile";
import { useConfigurations } from "./Configuration";
import { getAllTimes, getTimeTaken } from "./logAnalysis";
import ParticipantDetail, {
  configs,
  configToParsedLikelihoods,
} from "./ParticipantDetail";

const overviewMetrics: Metrics<Array<Configuration>> = {
  totalParticipants: (configurations) => configurations.length,
  percentConfigurationsComplete: {
    calculator: (configurations) =>
      (
        (configurations.filter(
          (configuration) =>
            indexToTaskNumber(configuration, getCurrentIndex(configuration)) /
            // subtract 1 because of the loading task.
            (getTotalTasks(configuration) - 1)
        ).length /
          configurations.length) *
        100
      ).toFixed(0),
    unit: "%",
    label: "Participants Complete",
  },
};

const Dashboard: React.FunctionComponent = () => {
  const configurations = useConfigurations();

  let parsedLikelihoods = configurations.flatMap(configToParsedLikelihoods);

  return (
    <>
      <TileMetrics value={configurations} metrics={overviewMetrics} />
      {/* TODO: style these to be nicer. */}

      <Histogram values={configurations.map(getTimeTaken)} title="Time Taken" />
      <Graph
        spec={{
          data: {
            values: configurations.flatMap((configuration) =>
              getAllTimes(configuration).map((times) => ({
                participant: configuration.participant || randomString(),
                ...times,
              }))
            ),
          },
          mark: "bar",
          encoding: {
            y: { field: "participant" },
            x: { aggregate: "sum", field: "timeTaken" },
            color: { field: "task" },
          },
        }}
      />
      <div>
        <h2 className="text-xl font-bold">Demographics</h2>
        <Graph
          spec={{
            data: {
              values: configurations.map((configuration) => {
                return {
                  // TODO: hack
                  // @ts-ignore
                  gender: configuration.googleFormsAnswers?.Gender,
                };
              }),
            },
            mark: "arc",
            encoding: {
              theta: { aggregate: "count", field: "gender" },
              color: { field: "gender", type: "nominal" },
            },
            view: { stroke: null },
          }}
        />
        <Graph
          spec={{
            data: {
              values: configurations.map((configuration) => {
                return {
                  // TODO: hack
                  education:
                    // @ts-ignore
                    configuration.googleFormsAnswers[
                      "What is the highest degree or level of education you have completed?"
                    ],
                };
              }),
            },
            mark: "arc",
            encoding: {
              theta: { aggregate: "count", field: "education" },
              color: { field: "education", type: "nominal" },
            },
            view: { stroke: null },
          }}
        />
        <Histogram
          values={configurations.map((configuration) =>
            // @ts-ignore
            parseInt(configuration.googleFormsAnswers.Age)
          )}
          title="Age"
        />
      </div>

      <div>
        <h2 className="text-xl font-bold">Likelihoods</h2>
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
              column: { field: "participant" },
            },
            view: { stroke: null },
          }}
        />
        <Graph
          spec={{
            data: {
              values: parsedLikelihoods,
            },
            layer: [
              {
                mark: "bar",
                encoding: {
                  y: { field: "likelihoodDiff", aggregate: "average" },
                  x: { field: "configStr", type: "nominal" },
                  color: { field: "configStr" },
                },
                view: { stroke: null },
              },
              {
                mark: { type: "errorbar", extent: "ci" },
                encoding: {
                  y: { field: "likelihoodDiff", aggregate: "average" },
                  x: { field: "configStr", type: "nominal" },
                },
                view: { stroke: null },
              },
            ],
          }}
        />
        <div>
          {Object.entries(configs).map(([name, config]) => (
            <Graph
              configParam={config}
              spec={{
                data: { values: [{ label: "", value: 50 }] },
                title: name,
                mark: {
                  type: "bar",
                  size: 50,
                },
                encoding: {
                  x: {
                    field: "label",
                    title: "",
                    type: "nominal",
                    axis: { labelAngle: 0, ticks: false },
                  },

                  y: {
                    field: "value",
                    title: "",
                    type: "quantitative",
                    scale: { domain: [0, 100] },
                  },
                },
                height: 300,
                width: 150,
              }}
            />
          ))}
        </div>
      </div>

      {configurations.map((configuration, i) => (
        <ParticipantDetail
          key={((configuration.participant as string) || "undefined") + i}
          configuration={configuration}
        />
      ))}
    </>
  );
};

export default Dashboard;
