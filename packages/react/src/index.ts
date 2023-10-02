import React, { PropsWithChildren, ReactElement } from "react";
import { ControlFunctions } from "./core/Experiment.js";
import * as allTasks from "./tasks/index.js";

export * from "./tasks/index.js";
export * from "./components/index.js";

export { allTasks };

export { withGridItem } from "./GridLayout.js";

export { default as GridLayout } from "./GridLayout.js";
export { default } from "./core/Experiment.js";
export * from "./core/Experiment.js";
export {
  BasePersistence,
  StoragePersistence,
  FileSystemPersistence,
} from "./persistence/index.js";

export interface FunctionTask<P = {}>
  extends React.FunctionComponent<P & ControlFunctions> {
  (
    props: PropsWithChildren<P & ControlFunctions>,
    context?: any
  ): ReactElement<any, any> | null;
}

export abstract class Task<P = {}, S = {}, SS = any> extends React.Component<
  P & ControlFunctions,
  S,
  SS
> {}
