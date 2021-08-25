import {
  Configuration,
  getPropsFor,
  iterateConfiguration,
  Log,
} from "@hcikit/workflow";

import { find, omit } from "lodash";

// TODO: this whole file could be in somewhere else, because scripts uses a similar function to the end function here.

// TODO: These "get times" should really be done better, they should use just one I think. I think the way to do that is to use indices.
function getStartTime(configuration: Configuration): number {
  let indices = Array.from(iterateConfiguration(configuration));
  let firstTask = getPropsFor(configuration, indices[0], false).logs || [];

  return (
    find(firstTask, {
      type: "START",
    })?.timestamp || NaN
  );
}

// TODO: should this really return 0 when it errors.
function getEndTime(configuration: Configuration): number {
  let indices = Array.from(iterateConfiguration(configuration));
  let endTime: number | undefined;

  for (let index of indices.reverse()) {
    let task = getPropsFor(configuration, index, false).logs || [];

    endTime = find(task, {
      type: "END",
    })?.timestamp;

    if (endTime) {
      break;
    }
  }
  return endTime || NaN;
}

// TODO: I probably don't need two different things for logs and the config. Maybe rather than passign entire configurations we shou;ld actually just pass all of the logs in.,
function getStartTimeForLogs(logs: Array<Log>): number {
  return (
    find(logs, {
      type: "START",
    })?.timestamp || NaN
  );
}

// TODO: should this really return 0 when it errors.
function getEndTimeForLogs(logs: Array<Log>): number {
  return (
    find(logs, {
      type: "END",
    })?.timestamp || NaN
  );
}

export function getTimeTaken(configuration: Configuration): number {
  const startTime = getStartTime(configuration);
  const endTime = getEndTime(configuration);

  return endTime - startTime;
}
export function getTimeTakenForLogs(logs: Array<Log>): number {
  const startTime = getStartTimeForLogs(logs);
  const endTime = getEndTimeForLogs(logs);

  return endTime - startTime;
}

export function millisecondsToMinutes(milliseconds: number): number {
  return milliseconds / 60000;
}

export function millisecondsToSeconds(milliseconds: number): number {
  return milliseconds / 1000;
}

export function getLogs(configuration: Configuration): Array<Log> {
  let logs: Array<Log> = [];
  for (let index of iterateConfiguration(configuration)) {
    let props = getPropsFor(configuration, index, false);
    if (props.logs) {
      logs = logs.concat(
        props.logs.map((log) => ({ ...omit(props, "logs"), index, ...log }))
      );
    }
  }

  return logs;
}

export function getAllTasks(
  configuration: Configuration
): Array<Configuration> {
  let allTasks: Array<Configuration> = [];

  for (let index of iterateConfiguration(configuration)) {
    let props = getPropsFor(configuration, index, false);
    allTasks.push(props);
  }

  return allTasks;
}

export function getAllTimes(
  configuration: Configuration
): Array<{ timeTaken: number; task: string }> {
  let times = [];
  for (let index of iterateConfiguration(configuration)) {
    let props = getPropsFor(configuration, index, false);
    if (props.logs) {
      times.push({
        timeTaken: getTimeTakenForLogs(props.logs),
        task: props.task || "NO_TASK",
      });
    }
  }

  return times;
}
