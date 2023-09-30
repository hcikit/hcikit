import { useConfiguration, withGridItem, useExperiment } from "@hcikit/react";
import {
  iterateConfiguration,
  getPropsFor,
  getCurrentIndex,
  Configuration,
  getConfigurationAtIndex,
} from "@hcikit/workflow";
import { isEqual } from "lodash";

function hash(string: string, max: number) {
  return (
    string.split("").reduce((prev, cur) => cur.charCodeAt(0) + prev, 0) % max
  );
}

const colours = [
  "bg-red-500",
  "bg-orange-500",
  "bg-green-500",
  "bg-blue-500",
  "bg-purple-500",
];

const mapping: Record<string, string> = {
  ConsentForm: "bg-gray-500",
  InformationScreen: "bg-gray-500",
  DisplayText: "bg-gray-500",
  "": "bg-gray-500",
};

export const ConfigVisualiserBase: React.FC = () => {
  const config = useConfiguration();
  const experiment = useExperiment();

  return (
    <div className="gap-[0.1em] flex w-full items-center justify-center">
      {Array.from(iterateConfiguration(config)).map((index) => {
        let props = getPropsFor(config, index);

        if (!mapping[props.task ?? ""]) {
          // TODO: assign a new colour in a stable way (using the task name ideally)
          mapping[props.task ?? ""] =
            colours[hash(props.task ?? "", colours.length) ?? ""];
        }

        return (
          <button
            onClick={() => {
              experiment.advance(index);
            }}
            className={`w-3 rounded-sm text-[0.1em] font-light cursor-pointer aspect-square hover:opacity-100 ${
              mapping[props.task ?? ""]
            } ${
              isEqual(index, getCurrentIndex(config))
                ? "opacity-100"
                : "opacity-50"
            }`}
          >
            {(props.task ?? "")[0]}
          </button>
        );
      })}
    </div>
  );
};

export const HierarchicalConfigVisualiserBase: React.FC = () => {
  const config = useConfiguration();
  const experiment = useExperiment();

  return (
    <div className="">
      <ConfigVis config={config} />
    </div>
  );
};

const ConfigVis: React.FC<{ config: Configuration }> = ({ config }) => {
  if (!mapping[config.task ?? ""]) {
    // TODO: assign a new colour in a stable way (using the task name ideally)
    mapping[config.task ?? ""] =
      colours[hash(config.task ?? "", colours.length) ?? ""];
  }
  const isLeaf = (config.children?.length ?? 0) === 0;

  console.log(config);

  return (
    <div
      className={`inline-flex gap-1 border rounded-sm items-center justify-center p-1 ${
        isLeaf ? "aspect-square w-4" : ""
      } ${isLeaf ? mapping[config.task ?? ""] : ""} opacity-75`}
    >
      {(config.children ?? []).map((c, i) => {
        const nextConfig = getConfigurationAtIndex(config, [i]);
        return <ConfigVis config={nextConfig} />;
      })}
    </div>
  );
};

export const ConfigVisualiser = withGridItem(
  HierarchicalConfigVisualiserBase,
  "task"
);
