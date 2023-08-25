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
  T extends Record<string, Record<string, unknown>> = Record<
    string,
    Record<string, unknown>
  >,
> {
  [__INDEX__]?: ExperimentIndex;

  task?: keyof T;
  tasks?: Array<keyof T>;

  logs?: Array<Log>;

  label?: string;
}

interface ConfigurationDisallowed {
  ref?: never;
  key?: never;
}

type MegaDict<T extends Record<string, Record<string, unknown>>> = T[keyof T];

type MappedPartial<T extends Record<string, Record<string, unknown>>> =
  Partial<{ [Key in keyof T]: Partial<T[Key]> }>;

export type TypedConfiguration<
  T extends Record<string, Record<string, unknown>> = Record<
    string,
    Record<string, unknown>
  >,
> = ConfigurationRequired<T> & // the basics that we need to operate on.
  //   Partial<Record<keyof T, unknown>> & // this was the prior way to incorporate passed in allowed props
  //   Record<string, unknown> & // This allows loose typing
  Partial<MegaDict<T>> &
  MappedPartial<T> &
  ConfigurationDisallowed & // eslint-disable-next-line no-use-before-define
  { children?: Array<TypedConfiguration<T>> };

export type ConfigurationNoGenerics = ConfigurationRequired;

export type Configuration<
  T extends Record<string, Record<string, unknown>> = Record<
    string,
    Record<string, any>
  >,
> = ConfigurationRequired<T> &
  Partial<Record<keyof T, unknown>> &
  Record<string, unknown> &
  ConfigurationDisallowed & { children?: Array<Configuration<T>> }; // eslint-disable-next-line no-use-before-define

// TODO: in an ideal world I would have a layer of misdirection here.
// the props in the workflow would take a dictionary mapping task names to their props. It would look like:

// I would create two types from this. One the typesafe type mappings with the name that is strictly typed as partials to a particular task.
// The second one would be the mega object of all of the typing possibilities

// type ComponentTaskTypes<T extends React.Component> = Record<string, React.ComponentProps<valueof T>>;

// TODO: This doesn't solve the last problem which is that I want this type to easily extend from the task,
// then I don't need to type everything all over the place. I could make it so from App.tsx it re-exports configuration
// from what we want?

// TODO: Should it be strict or allow for people to change it a little bit? Meaning it could just provide type hints, or it could be strict.
// Strict is likely nicer. People can ts-ignore if they want to. Or I can add a prop like metadata that they can extend from I think?
