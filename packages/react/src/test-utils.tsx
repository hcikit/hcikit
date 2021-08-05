import { render, RenderResult } from "@testing-library/react";

import {
  ConfigContext,
  ConfigMutatorContext,
  ControlFunctions,
} from "./core/Experiment";
import { Configuration, ExperimentIndex } from "@hcikit/workflow";
import React from "react";

const identities: ControlFunctions = {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  advance: (_index?: ExperimentIndex) => {
    // do nothing.
  },
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  log: (_log: unknown) => {
    // do nothing.
  },
  modify: (
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _modifiedConfig: Record<string, unknown>,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _index?: ExperimentIndex
  ) => {
    // do nothing.
  },
};

export const renderWithProvider = (
  Component: React.ReactElement,
  funcs: Partial<ControlFunctions> = identities,
  configuration: Configuration = {}
): RenderResult => {
  return render(
    <ConfigContext.Provider value={configuration}>
      <ConfigMutatorContext.Provider value={{ ...identities, ...funcs }}>
        {Component}
      </ConfigMutatorContext.Provider>
    </ConfigContext.Provider>
  );
};
