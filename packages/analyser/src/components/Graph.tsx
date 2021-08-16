import { VegaLite, PlainObject, VisualizationSpec } from "react-vega";

const config = {};

// TODO: would be nice to get tailwind variables so we can use them to style the graphs

const Graph: React.FunctionComponent<{
  data?: PlainObject;
  spec: VisualizationSpec;
}> = ({ spec, data }) => {
  return <VegaLite actions={false} spec={spec} data={data} config={config} />;
};

export const Histogram: React.FunctionComponent<{
  values: Array<number>;
  title: string;
}> = ({ values, title }) => {
  return (
    <Graph
      spec={{
        data: { values },
        mark: "bar",
        encoding: {
          x: {
            bin: true,
            field: "data",
            title,
          },
          y: {
            aggregate: "count",
          },
        },
      }}
    />
  );
};

export default Graph;
