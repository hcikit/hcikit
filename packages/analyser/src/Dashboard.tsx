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
import ParticipantDetail from "./ParticipantDetail";

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
      <Graph
        spec={{
          data: {
            values: configurations.map((configuration) => {
              // @ts-ignore
              console.log(configuration.googleFormsAnswers?.Gender);
              console.log(configuration.googleFormsAnswers);

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
