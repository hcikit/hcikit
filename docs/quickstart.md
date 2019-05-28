# Quickstart

HCI Kit is super easy to get started. We'll cover how to create your first experiment and capture data, all the way through getting the data into your favourite analysis tool.

First, make sure you've installed node so we can use NPM.

To make things really easy we built a version of `create-react-app` but for hci experiments called. Simply run:

```
npx create-react-app my-project --scripts-version @hcikit/hci-scripts
```

This created a folder called my-project with some awesome things inside:

- A working build environment using `create-react-app`
- Starts with an example experiment.

If we want to test our experiment just enter `npm start` which opens your browser with the example experiment already running. Feel free to run through the experiment and get a feel for the user experience. Download your logs by clicking the button at the end.

That's really all you need to run a local experiment. You can bring participants into the lab, have them run that experiment and download all of the log files.

We'll cover more advanced cases like crowdsourcing in XXX.

For now, our experiment is missing a consent form and we'll have to add one of those. HCI Kit already comes with a built-in consent form so let's configure one of those.

There's two steps to adding a new task. First, we need to register it, and then we add it into our configuration.

Registering tasks is tedious but it reduces our bundle size by explicitly writing which packages we need and which we don't. It also allows us to add new tasks from community packages and custom ones we develop ourselves.

To register a task we need to import the registerTask function from the workflow package. We've already done that in the example

```
import Experiment, { registerTask } from "@hcikit/workflow";
```

Next we import the task we want by editing the line

```
import { InformationScreen, ... } from "@hcikit/tasks";
```

To be:

```
import { InformationScreen, ConsentForm, ... } from "@hcikit/tasks";
```

Now we can register the task like:

```
registerTask('ConsentForm', ConsentForm)
```

It's good practice to use capitalised camel case.

Now that we've registered the ConsentForm we can use it in our configuration. Open `configuration.js` and let's add it in. We can see the props ConsentForm takes in the tasks documentation. [LINK]

Add the consent form as the first element of the children array:

```{
  ...

  children: [
    {
      task : 'ConsentForm',
      letter:,
      questions: {
        'label': 'I consent to my data being collected in this experiment',
        required: true
      }
    },
    {
      task: 'InformationScreen',
      ...
    },
    ...
  ]
}
```

Task and children are both special properties in the configuration. Children let's the workflow know what order to run things in, they can be nested as deep as needed like this:

```
{
  children: [
    {
      children: [
        ...
      ]
    },
    {
      children: [
        ...
      ]
    }
  ]
}
```

Task tells the Workflow which component it should render based on the string sent to registerTask.

The configuration understands inheritance, properties pass downwards automatically, but the lower properties override the ones above.
