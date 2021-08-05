import React, { PropsWithChildren, ReactElement } from "react";
import { ControlFunctions } from "./core/Experiment";
import * as allTasks from "./tasks";

export * from "./tasks";
export * from "./components";

export { allTasks };

export { withGridItem } from "./GridLayout";

export { default as GridLayout } from "./GridLayout";
export { default } from "./core/Experiment";
export * from "./core/Experiment";

export interface FunctionTask<P = {}>
  extends React.FunctionComponent<P & ControlFunctions> {
  (props: PropsWithChildren<P & ControlFunctions>, context?: any): ReactElement<
    any,
    any
  > | null;
}

export abstract class Task<P = {}, S = {}, SS = any> extends React.Component<
  P & ControlFunctions,
  S,
  SS
> {}
