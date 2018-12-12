# cefn

> An experimental framework for running Human Computer Interaction experiments.

[![NPM](https://img.shields.io/npm/v/cefn.svg)](https://www.npmjs.com/package/cefn) [![JavaScript Style Guide](https://img.shields.io/badge/code_style-standard-brightgreen.svg)](https://standardjs.com)

## Install

```bash
npm install --save cefn
```

## Usage

```jsx
import React, { Component } from "react";

import Experiment from "cefn";

class Example extends Component {
  render() {
    return <MyComponent />;
  }
}
```

## Development

To install the development version, clone the package from github.

```bash
git clone https://github.com/blainelewis1/cefn
cd cefn
npm install
npm run build
```

Then install the package from your local package to test. The package must be built.

```bash
cd my-project
npm install --save ../cefn
```

If you're creating a new task then make sure you have the framework running with npm start to ensure it constantly gets compiled. There is also a working example in the example folder.

## Contributing

This package is bundled using `create-react-library`

## License

MIT © [blainelewis1](https://github.com/blainelewis1)
