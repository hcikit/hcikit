export default class TaskRegistry {
  reducers = {};

  constructor(tasks) {
    this.tasks = tasks || {};
  }

  /**
 *
 * registerTask("MyTask", MyTask))
 *
 * @param {string} taskName, the name of the component for lookup in configuration
 * @param {function} task, the component

 */
  registerTask = (taskName, task, reducer = undefined) => {
    this.tasks[taskName] = task;

    if (reducer) {
      this.reducers[taskName] = reducer;
    }
  };

  getReducers = () => this.reducers;

  getTask = task => {
    if (!this.tasks[task]) {
      throw new Error(`Task ${task} isn't registered.`);
    }

    return this.tasks[task];
  };
}
