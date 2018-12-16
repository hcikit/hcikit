import { zip, max, flatten, flatMap } from 'lodash'

// TODO: this file should be split into many pieces.
// TODO: Add a version number with minor and major and maybe major name to let things be better. Then you can t4rack which runs
// TODO: URL params should overwrite config values
// TODO: log things like page refreshes.
// TODO: create a metadata field to scope things for easy removal when parsing.

// TODO: configs are suuuper volatiile because of the random aspect, if you change the order of anything it wrecks everything.
// TODO: Maybe we reseed the random all the time to fix that?

export function trialsWithDistribution(frequencies, stimuli) {
  let result = flatten(
    frequencies.map((frequency, rank) =>
      Array(frequency).fill({
        stimulus: stimuli[rank],
        rank,
        frequency
      })
    )
  )
  return result
}

export function itemsFromMenu(menu) {
  return flatMap(menu, menu => menu.items.map(item => item))
}

export function stimuliFromMenu(menu) {
  return itemsFromMenu(menu).map(({ command: stimulus }) => ({ stimulus }))
}

/**
 * Takes a list of tasks and creates a new level with them occurring after one another.
 * Objects are automatically duplicated if given.
 * @param {String} level Level to label the next piece of config
 * @param {Array|Object} tasks either an array of tasks or an object to duplicate
 */
export function compoundTask(level, ...tasks) {
  let biggest = max(tasks.map(task => task.length))

  tasks = tasks.map(task =>
    Array.isArray(task) ? task : Array(biggest).fill(task)
  )

  let result = zip(...tasks).map(taskInstances => ({
    nextLevel: level,
    children: taskInstances
  }))

  return result
}

export function addBetween(levels, config, task, end = true) {
  if (!config.children) {
    return config
  } else if (levels.indexOf(config.nextLevel) > -1) {
    config.children = addBetweenArray(config.children, task, end)
  }

  // recurse recurse
  config.children.forEach(child => addBetween(levels, child, task, end))
  return config
}

// TODOLATER: could probably use flatmapdeep to avoid first if statement.
export function addBetweenArray(arr, elem, end = true) {
  return flatMap(arr, (child, index, children) => {
    let added
    if (Array.isArray(elem)) {
      added = [child, ...elem]
    } else {
      added = [child, elem]
    }
    if (end || children.length - 1 !== index) {
      return added
    } else {
      return child
    }
  })
}
