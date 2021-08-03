import React, { useState } from "react";
import { Configuration } from "@hcikit/workflow";
import { useEffect } from "react";
import { get, set } from "idb-keyval";

type NonEmptyArray<T> = T[] & { 0: T };

let CONFIGURATIONS_PATH = "CONFIGURATIONS_PATH";

const ConfigurationsContext = React.createContext<
  NonEmptyArray<Configuration> | undefined
>(undefined);

async function getAllFileHandlesRecursive(
  topLevel: FileSystemDirectoryHandle,
  extension: string | undefined
): Promise<Array<FileSystemFileHandle>> {
  const fileHandles: Array<FileSystemFileHandle> = [];

  for await (const handle of topLevel.values()) {
    if (handle.kind === "directory") {
      fileHandles.push(
        ...(await getAllFileHandlesRecursive(handle, extension))
      );
    } else if (!extension || handle.name.endsWith(extension)) {
      fileHandles.push(handle);
    }
  }

  return fileHandles;
}

const ConfigurationsProvider: React.FunctionComponent = ({ children }) => {
  const [status, setStatus] = useState<
    "loading" | "loaded" | "error" | "awaiting user" | "no permission"
  >("loading");
  const [configurations, setConfigurations] = useState<Array<Configuration>>();
  async function loadConfigurations() {
    let configurationsFileHandle = await get<FileSystemDirectoryHandle>(
      CONFIGURATIONS_PATH
    );
    if (!configurationsFileHandle) {
      setStatus("awaiting user");
    } else {
      if ((await configurationsFileHandle.queryPermission()) === "granted") {
        setStatus("loading");

        let handles = await getAllFileHandlesRecursive(
          configurationsFileHandle,
          "json"
        );

        let configurations = await Promise.all(
          handles.map(async (handle) =>
            JSON.parse(await (await handle.getFile()).text())
          )
        );

        setConfigurations(configurations as Array<Configuration>);
        setStatus("loaded");
      } else {
        setStatus("no permission");
      }
    }
  }

  useEffect(() => {
    loadConfigurations();
  }, []);

  if (status === "loading") {
    return <div>Loading</div>;
  } else if (status === "awaiting user" || status === "no permission") {
    return (
      <button
        onClick={async () => {
          const directoryHandle = await window.showDirectoryPicker();
          set(CONFIGURATIONS_PATH, directoryHandle);
          loadConfigurations();
        }}
      >
        Open folder of configurations
      </button>
    );
  }

  if (status === "loaded" && configurations && configurations.length > 0) {
    // return children if its loaded otherwise return loading or login
    return (
      <ConfigurationsContext.Provider
        value={configurations as NonEmptyArray<Configuration>}
      >
        {children}
      </ConfigurationsContext.Provider>
    );
  } else {
    return null;
  }
};

export function useConfigurations() {
  const context = React.useContext(ConfigurationsContext);
  if (context === undefined) {
    throw new Error(
      "useConfigurations must be used within a ConfigurationsProvider"
    );
  }
  return context;
}
export { ConfigurationsProvider };
