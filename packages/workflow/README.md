# cefn

> An experimental framework for running Human Computer Interaction experiments.

[![NPM](https://img.shields.io/npm/v/cefn.svg)](https://www.npmjs.com/package/cefn) [![JavaScript Style Guide](https://img.shields.io/badge/code_style-standard-brightgreen.svg)](https://standardjs.com)

## Install

```bash
npm install --save @blainelewis1/cefn
```

## Usage

```jsx
import React, { Component } from "react";

import Experiment from "cefn";

config = {
  InformationScreen:
"
# Experiment name

Complete the experiment by clicking on the red circles.
",

  task: "InformationScreen"
}

class Example extends Component {
  render() {
    return <Experiment config={config} />;
  }
}
```

## Usage:

To create a new task, use the "registerTask" function like:

```
registerTask("MyTask", () => import("./MyTask"));
```

Basically this is a taskname to map to the config and then a function that returns a promise of a task component.

Tasks are passed 3 actions:

`onAdvanceWorkflow` which continues to the next task, trial or other object.
`onLog` which allows you to log a key value pair, with a timestamp.
`onEditConfig` which places a new property on the top level of the config. Useful for calibration tasks.

## Development

To install the development version, clone the package from github.

```bash
git clone https://github.com/blainelewis1/cefn
cd cefn
npm install
npm run build
```

Then install the package from your local repository to test. The package must be built.

```bash
cd my-project
npm install --save ../cefn
```

If you're creating a new task then make sure you have the framework running with npm start to ensure it constantly gets compiled. There is also a working example in the example folder.

Running examples is surprisingly complicated because we use peer dependencies. In order to run tests and build the styleguide we need to have our peer dependencies included as devDependencies. However, when you test the example using `npm install --save ../cefn` it uses the devDependencies and ends up with multiple copies of React which is very bad.

The easiest way to overcome this is to first remove all `node_modules` in the root project. And then run `npm link --only=production` from inside the root folder. From the examples you and then `cd examples` and run `npm link @blainelewis1/cefn`

This approach is problematic because you lose the ability to view the example while you actively develop.

Another potential approach is to actually remove the dependencies from the example.

## Contributing

This package is bundled using `create-react-library`

## License

MIT © [blainelewis1](https://github.com/blainelewis1)
