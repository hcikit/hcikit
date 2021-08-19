import {
  Configuration,
  experimentComplete,
  randomString,
} from "@hcikit/workflow";
import Graph, { Histogram } from "./components/Graph";
import { Metrics, TileMetrics } from "./components/Tile";
import { useConfigurations } from "./Configuration";
import { getAllTimes, getTimeTaken } from "./logAnalysis";
import ParticipantDetail from "./ParticipantDetail";

const overviewMetrics: Metrics<Array<Configuration>> = {
  totalParticipants: (configurations) => configurations.length,
  percentConfigurationsComplete: (configurations) =>
    configurations.filter((configuration) => experimentComplete(configuration))
      .length / configurations.length,
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
