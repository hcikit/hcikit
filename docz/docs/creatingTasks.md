# Creating Tasks

Tasks are simply React components. They are special because they get passed a series of callbacks that interact with the framework.

### onAdvanceWorkflow

This function can be called when the task is complete and the workflow should move onto the next task.

### onLog

onLog places a log into the configuration. Because this logs directly into the configuration it's possible to change the properties of the current task. It's also possible to use it in more creative ways such as to create new `children` of the current task.

### onEditConfig

This function edits the top level of the configuration, it can be useful to make live edits to the

### onAdvanceWorkflowLevelTo

This is an advanced function that can be used to advance the worklow to arbitrary places in the config. We don't recommend calling it, however to see an example of it's use check out ExperimentProgress.

## Example

One example of a task might be to

```
const ExampleTask = () => {

}

```

## With Redux

Under the hood HCI Kit uses Redux to manage state. Tasks can use their own state if they want, but several features are available if they choose to use Redux instead. Redux let's us automatically log UI events making it easier and automatic to capture the things users do.

Redux works by defining a set of actions that can mutate state. A simple example might be a counter. A counter can `INCREMENT`, `DECREMENT`, and `SET`. A reducer is called when those actions occur and creates a new state to represent the state after those actions.

```
let INCREMENT = "INCREMENT";
let DECREMENT = "DECREMENT";
let RESET = "RESET";

let increment = (by) => ({ type: INCREMENT });
let decrement = (by) => ({ type: DECREMENT });
let set = (newValue) => ({ type: RESET, newValue });

export const reducer = (state = 0, action) => {
  switch (action.type) {
    case INCREMENT:
      return state + 1;
    case DECREMENT:
      return state - 1;
    case RESET:
      return action.newValue;
    default:
      return state;
  }
};
```

This is convenient because on your logs you will have something like:

```
{
  actions: [
    {
      type: 'INCREMENT',
      timestamp: 1558836279621
    },
    {
      type: 'DECREMENT',
      timestamp: 1558836279755
    },
    ...
  ]
}
```

HCI Kit automatically logs all actions.

To use these actions and the underlying state with your task you must `connect` your component to the state. You do this using `react-redux`.

```connect(
    state => ({
      value: state.Counter // This line is important
    }),
    {
      increment,
      decrement,
      set
    }
  )(Counter)
```

This snippet does a few things. The first argument to connect is a function that takes the state as an argument and returns the portion of the state you are interested in. The second argument is an object that creates a

The line that says "This line is important" is important. The name matched by Counter, must match the call made to registerTask("Counter", Counter). It's recommended you export a function to register your task for you like:

```
const register = (registerTask) => registerTask("Counter", Counter, reducer)
```

This ensures your task will be registered properly.

It is important that a reducer does not mutate the state. It can break things and be very difficult to debug.

## withGridItem

In order to keep layout flexible we needed something to make layouts. We decided to use the CSS Grid layout, this way we can lay things out regardless of the order they are rendered in. The easiest way to opt into the layout is to wrap your component in a withGridItem call. The function takes two arguments, the first being your component and the second an optional argument to choose a grid area. The default is the `task` area which stretches to take up the entire space.

There are two other areas in the default layout, a footer and a header. Both of these will stretch to be as big as the elements you place inside of them.

The convient part of the layout is it can be changed at runtime.
