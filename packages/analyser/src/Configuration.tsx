import React, { useState } from "react";
import { Configuration } from "@hcikit/workflow";
import { useEffect } from "react";
import { get, set } from "idb-keyval";
import { fetchGoogleForm } from "./fetchGoogleForm";
import Loading from "./components/Loading";

// TODO: load directly from S3 would be nice too.
// TODO: it currently forces me to give permissions every single time it is refereshed which seems a bit problematic.

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

        let googleFormsAnswers = await fetchGoogleForm(
          "1HD1kF8JakzHHAeJDTuudo-CP4Akk1C4NFxZiMfZy_GE"
        );

        for (let configuration of configurations) {
          for (let googleFormsAnswer of googleFormsAnswers) {
            if (googleFormsAnswer["Worker ID"] === configuration.WORKER_ID) {
              configuration.googleFormsAnswers = googleFormsAnswer;
              configuration["education"] =
                configuration.googleFormsAnswers[
                  "What is the highest degree or level of education you have completed?"
                ];
            }
          }
        }

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
    return <Loading />;
  } else if (status === "awaiting user" || status === "no permission") {
    return (
      <div className="flex h-screen">
        <div className="m-auto">
          <button
            className="bg-transparent hover:bg-gray-500 text-gray-700 font-semibold hover:text-white py-2 px-4 border border-gray-500 hover:border-transparent rounded"
            onClick={async () => {
              const directoryHandle = await window.showDirectoryPicker();
              set(CONFIGURATIONS_PATH, directoryHandle);
              loadConfigurations();
            }}
          >
            Open folder of configurations
          </button>
        </div>
      </div>
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
