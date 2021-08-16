import { startCase } from "lodash";
import React from "react";

const Tile: React.FunctionComponent<{
  label: string;
  value: string | number;
  unit?: string;
}> = ({ label, value, unit }) => {
  return (
    <div className="text-center px-6 py-2 m-1 border border-solid border-gray-400 shadow-sm rounded inline-block">
      <div>
        <span className="text-xl font-bold">
          {typeof value === "number" ? value.toFixed(2) : value}{" "}
        </span>
        {unit ? <span className="text-sm text-gray-500">{unit}</span> : null}
      </div>
      <div className="text-sm text-gray-500">{label}</div>
    </div>
  );
};

export const TileGroup: React.FunctionComponent<{ children: React.ReactNode }> =
  ({ children }) => {
    return <div className="flex">{children}</div>;
  };

export type Metrics<T> = Record<
  string,
  | ((values: T) => number)
  | { calculator: (values: T) => number; unit?: string; label?: string }
>;

type TileMetricsProps<T> = {
  metrics: Metrics<T>;
  value: T;
};

export const TileMetrics = <T extends unknown>({
  metrics,
  value,
}: TileMetricsProps<T>): React.ReactElement | null => {
  const filledMetrics = Object.entries(metrics).map(([key, metric]) => {
    if (typeof metric === "function") {
      return { calculated: metric(value), label: startCase(key), key };
    } else {
      return {
        label: metric.label || startCase(key),
        unit: metric.unit,
        key,
        calculated: metric.calculator(value),
      };
    }
  });

  return (
    <TileGroup>
      {filledMetrics.map(({ key, label, calculated, unit }) => (
        <Tile key={key} label={label} value={calculated} unit={unit} />
      ))}
    </TileGroup>
  );
};

export default Tile;
