#!/usr/bin/env node
import { promises as fs } from "fs";

import {
  Configuration,
  flattenConfigurationWithProps,
  getPropsFor,
  iterateConfiguration,
} from "@hcikit/workflow";
import glob from "glob-promise";
import { groupBy, omit, partition } from "lodash";
import { parse } from "json2csv";
import path from "path";

export let command = "analyse-csvs";

export let builder = {};

export let describe = "Creates csvs from a data directory.";

exports.handler = async () => {
  let paths = await glob("./data/**/*.json");
  let configs = await Promise.all(
    paths.map((path) =>
      fs.readFile(path, "utf8").then((s) => JSON.parse(s) as Configuration)
    )
  );
  let flattenedConfigs = configs.flatMap((config) => {
    let logs: Array<Record<string, unknown>> = [];
    for (let index of iterateConfiguration(config)) {
      let props = getPropsFor(config, index, false);
      if (props.logs) {
        logs = logs.concat(
          props.logs.map((log) => ({ ...omit(props, "logs"), ...log, index }))
        );
      }
    }

    return logs;
  });

  let configsByTask = groupBy<Record<string, unknown>>(
    flattenedConfigs,
    "task"
  );

  console.log(configsByTask.length);

  await Promise.all(
    Object.entries(configsByTask).map(([task, taskArray]) => {
      if (!taskArray.length) {
        return;
      }

      let file = parse(taskArray);
      let filename = path.join("data", `${task}.csv`);
      return fs.writeFile(filename, file);
    })
  );

  console.log("CSVs Written");
};
