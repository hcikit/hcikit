export type ExperimentIndex = Array<number>;

export type Log = {
  timestamp: number;
  type: string;
  [k: string]: unknown;
};

export const __INDEX__ = "__INDEX__";

type Omit2<T, Key extends keyof T> = {
  [K in keyof T as K extends Key ? never : K]: T[K];
};

export type UnfilledLog = Omit2<Log, "timestamp">;

// Task cannot be required because props can propagate
interface ConfigurationRequired<
  T extends Record<string, unknown> = Record<string, unknown>
> {
  [__INDEX__]?: ExperimentIndex;
  // eslint-disable-next-line no-use-before-define
  children?: Array<Configuration<T>>;

  task?: keyof T | string;
  tasks?: Array<keyof T | string>;

  logs?: Array<Log>;
}

interface ConfigurationDisallowed {
  ref?: never;
  key?: never;
}

export type Configuration<
  T extends Record<string, unknown> = Record<string, unknown>
> = ConfigurationRequired<T> &
  Partial<Record<keyof T, unknown>> &
  Record<string, unknown> &
  ConfigurationDisallowed;

export type ConfigurationNoGenerics = Configuration<Record<string, unknown>>;
