# HCI Kit Typescript CRA Template

This is a package containing files to create a new HCI Kit project. The best way to use this template is by running:

```{bash}
npx create-react-app my-app --template @hcikit
```

NOTE: this package is almost a duplicate, it's important that template.json is updated to use the same scripts etc from the `@hcikit/cra-template` package.

## Developing / Contributing

Checkout the documentation on [CRA templates](https://create-react-app.dev/docs/custom-templates/).

The command above is magic for:

```{bash}
npx create-react-app my-app --template @hcikit/cra-template
```

You can test this template locally by running:

```{bash}
npx create-react-app my-app --template file:../path/to/your/template/cra-template-
```

The template does two important things

1. It installs required packages like [`@hcikit/react`](github.com/hcikit/hcikit), `@material-ui`, and any other packages we deem to be required.
1. It creates a starter project and experiment that can be used to start using HCI Kit.

We typically just copy and paste the files from CRA. The default template is at https://github.com/facebook/create-react-app/tree/master/packages/cra-template

And then we do the same with the `src` files from the example in HCI Kit. This means that the files are likely to be tested and working.
