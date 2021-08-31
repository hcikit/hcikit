import {
  Configuration,
  getCurrentIndex,
  getTotalTasks,
  indexToTaskNumber,
  randomString,
} from "@hcikit/workflow";
import { extent, scaleLinear } from "d3";
import { find, groupBy, map } from "lodash";
import Graph, { Histogram } from "./components/Graph";
import { Metrics, TileMetrics } from "./components/Tile";
import { useConfigurations } from "./Configuration";
import { getAllTasks, getAllTimes, getTimeTaken } from "./logAnalysis";
import ParticipantDetail, {
  configs,
  configToParsedLikelihoods,
} from "./ParticipantDetail";

// TODO: the organisation of all of this is actually just absolutely awful. I actually think these should all be MDX files and at the top I do the data munging or something like that, and then create graphs using mdx.
// It also needs nice default styles...

// I basically just need to separate the data munging from the data visualisation.

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

// TODO: how do I normalise the data?

// Basically I need to look at each participant, and create a normalisedLikelihood field, then normalise it down to be 0-1 or something?
const Dashboard: React.FunctionComponent = () => {
  const configurations = useConfigurations();

  let likelihoods = configurations.flatMap((configuration) => {
    let tasks = getAllTasks(configuration);
    let tasksGrouped = groupBy(tasks, "task");

    let notAttentionChecks = tasksGrouped["AskQuestionsGraph"].filter(
      ({ type }) => type !== "attention_check"
    );

    let likelihoods = notAttentionChecks.map((check) => ({
      ...check,
      ...find(check.logs, { type: "question_completed" }),
    }));

    let likelihoodExtent = extent(
      map(likelihoods, "likelihood") as number[]
    ) as number[];
    let normaliser = scaleLinear().domain(likelihoodExtent).range([0, 1]);

    for (let log of likelihoods) {
      log.likelihoodNormalised = normaliser(log.likelihood as number);
    }

    return likelihoods;
  });

  let parsedLikelihoods = configurations.flatMap(configToParsedLikelihoods);

  let educationGroupsParsed = groupBy(parsedLikelihoods, "education");
  let educationGroupsUnparsed = groupBy(likelihoods, "education");

  let eduGroups = Object.entries(educationGroupsUnparsed).map(
    ([group, data]) => (
      <div>
        <h3 className="text-xl text-bold">{group}</h3>
        <Graph
          spec={{
            data: {
              values: data,
            },
            mark: "point",
            encoding: {
              x: {
                field: "diff",
                type: "quantitative",
                scale: { domain: [-10, 10] },
              },
              y: {
                field: "likelihoodNormalised",
                type: "quantitative",
                scale: { domain: [0, 1] },
              },
              column: { field: "participant" },
            },
          }}
        />
      </div>
    )
  );

  let eduGroupsParsed = Object.entries(educationGroupsParsed).map(
    ([group, data]) => (
      <div>
        <h3 className="text-xl text-bold">{group}</h3>
        <Graph
          spec={{
            data: {
              values: data,
            },
            mark: "point",
            encoding: {
              x: {
                field: "absDiff",
                type: "quantitative",
                scale: { domain: [0, 10] },
              },
              y: {
                field: "likelihoodDiffNormalised",
                type: "quantitative",
                scale: { domain: [-1, 1] },
              },
              column: { field: "participant" },
            },
          }}
        />
      </div>
    )
  );

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

        <h3 className="text-lg font-bold">Likelihoods by graph</h3>

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
        <br />
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

              column: {
                field: "education",
              },
            },
            view: { stroke: null },
          }}
        />
        <br />
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

        <h3 className="text-lg font-bold">Likelihoods by normalised</h3>

        <Graph
          spec={{
            data: {
              values: parsedLikelihoods,
            },
            mark: "bar",
            encoding: {
              y: { field: "likelihoodDiffNormalised", aggregate: "average" },
              x: { field: "configStr", type: "nominal" },
              color: { field: "configStr" },
              column: { field: "participant" },
            },
            view: { stroke: null },
          }}
        />
        <br />
        <Graph
          spec={{
            data: {
              values: parsedLikelihoods,
            },
            mark: "bar",
            encoding: {
              y: { field: "likelihoodDiffNormalised", aggregate: "average" },
              x: { field: "configStr", type: "nominal" },
              color: { field: "configStr" },

              column: {
                field: "education",
              },
            },
            view: { stroke: null },
          }}
        />
        <br />
        <Graph
          spec={{
            data: {
              values: parsedLikelihoods,
            },
            layer: [
              {
                mark: "bar",
                encoding: {
                  y: {
                    field: "likelihoodDiffNormalised",
                    aggregate: "average",
                  },
                  x: { field: "configStr", type: "nominal" },
                  color: { field: "configStr" },
                },
                view: { stroke: null },
              },
              {
                mark: { type: "errorbar", extent: "ci" },
                encoding: {
                  y: {
                    field: "likelihoodDiffNormalised",
                    aggregate: "average",
                  },
                  x: { field: "configStr", type: "nominal" },
                },
                view: { stroke: null },
              },
            ],
          }}
        />

        <h3 className="text-lg font-bold">Likelihoods by absdiff</h3>

        <Graph
          spec={{
            data: {
              values: parsedLikelihoods,
            },
            layer: [
              {
                mark: "line",
                encoding: {
                  y: { field: "likelihoodDiff", aggregate: "average" },
                  x: { field: "absDiff", type: "quantitative" },
                },
                view: { stroke: null },
              },
              {
                mark: { type: "errorbar", extent: "ci" },
                encoding: {
                  y: { field: "likelihoodDiff", aggregate: "average" },
                  x: { field: "absDiff", type: "quantitative" },
                },
                view: { stroke: null },
              },
            ],
          }}
        />

        <Graph
          spec={{
            data: {
              values: parsedLikelihoods,
            },
            layer: [
              {
                mark: "line",
                encoding: {
                  y: { field: "likelihoodDiff", aggregate: "average" },
                  x: { field: "absDiff", type: "quantitative" },
                  color: { field: "participant" },
                },
                view: { stroke: null },
              },
            ],
          }}
        />

        <h3 className="text-lg font-bold">Likelihoods by absdiff normalised</h3>

        <Graph
          spec={{
            data: {
              values: parsedLikelihoods,
            },
            layer: [
              {
                mark: "line",
                encoding: {
                  y: {
                    field: "likelihoodDiffNormalised",
                    aggregate: "average",
                  },
                  x: { field: "absDiff", type: "quantitative" },
                },
                view: { stroke: null },
              },
              {
                mark: { type: "errorbar", extent: "ci" },
                encoding: {
                  y: {
                    field: "likelihoodDiffNormalised",
                    aggregate: "average",
                  },
                  x: { field: "absDiff", type: "quantitative" },
                },
                view: { stroke: null },
              },
            ],
          }}
        />

        <Graph
          spec={{
            data: {
              values: parsedLikelihoods,
            },
            layer: [
              {
                mark: "line",
                encoding: {
                  y: {
                    field: "likelihoodDiffNormalised",
                    aggregate: "average",
                  },
                  x: { field: "absDiff", type: "quantitative" },
                  color: { field: "participant" },
                },
                view: { stroke: null },
              },
            ],
          }}
        />

        <div>
          <h2 className="text-2xl">Education likelihoods</h2>
          {eduGroups}
          <h2 className="text-2xl">Education likelihood differences</h2>
          {eduGroupsParsed}
        </div>

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
      <h2 className="text-xl font-bold">Demographics</h2>

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
