import * as tasks from "./tasks";
export * from "./tasks";
export * from "./components";
// TODO:  this might force them all to be imported.. Not sure how tree shaking works... This should probably be in a file all by itself.
// TODO: this doesn't actually work for the reducer based ones
export function registerAll(registerTask) {
  Object.keys(tasks).forEach(key => registerTask(key, tasks[key]));
}

export { withGridItem } from "./withGridItem";
