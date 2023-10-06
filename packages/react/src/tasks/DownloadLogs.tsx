import React from "react";
import { FunctionTask, useConfiguration } from "../index.js";
import { CenteredNicePaper } from "../components/index.js";

export let DownloadLogs: FunctionTask<{ message: string; title: string }> = ({
  message,
  title,
}) => {
  const config = useConfiguration();
  return (
    <div style={{ gridArea: "task" }}>
      <CenteredNicePaper>
        <h2>{title}</h2>
        <p>{message}</p>
        <a
          download={`${config.participant || "log"}.json`}
          href={`data:text/json;charset=utf-8,${encodeURIComponent(
            JSON.stringify(config)
          )}`}
        >
          Download experiment log
        </a>
      </CenteredNicePaper>
    </div>
  );
};
