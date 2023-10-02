import { render, RenderResult } from "@testing-library/react";

import {
  ConfigContext,
  ConfigMutatorContext,
  ControlFunctions,
} from "./core/Experiment.js";
import { Configuration, ExperimentIndex } from "@hcikit/workflow";
import React from "react";
import { BasePersistence } from "./persistence/index.js";

class DoNothingPersistence extends BasePersistence {
  load(): Promise<Configuration | undefined> {
    return Promise.resolve(undefined);
  }
  save(state: Configuration): Promise<void> {
    return Promise.resolve();
  }
  clear(): Promise<void> {
    return Promise.resolve();
  }
  init(): Promise<void> {
    return Promise.resolve();
  }
}

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
  persistence: new DoNothingPersistence(),
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
