export default class TaskRegistry {
  tasks = {};
  reducers = {};

  constructor(tasks) {
    this.tasks = tasks;
  }

  /**
 *
 * registerTask("MyTask", MyTask))
 *
 * @param {string} taskName, the name of the component for lookup in configuration
 * @param {function} task, the component

 */
  registerTask = (taskName, task, reducer = undefined) => {
    tasks[taskName] = task;

    if (reducer) {
      reducers[taskName] = reducer;
    }
  };

  getReducers = () => this.reducers;

  getTask = taskName => {
    if (!this.tasks[taskName]) {
      throw new Error(`Task ${task} isn't registered.`);
    }

    return this.tasks[taskName];
  };
}
