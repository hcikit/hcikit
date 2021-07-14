import babel from "rollup-plugin-babel";
import commonjs from "@rollup/plugin-commonjs";
import resolve from "@rollup/plugin-node-resolve";
import pkg from "./package.json";
import postcss from "rollup-plugin-postcss";

export default {
  input: "src/index.js",
  output: [
    {
      file: pkg.main,
      format: "cjs",
      sourcemap: true,
    },
    {
      file: pkg.module,
      format: "es",
      sourcemap: true,
    },
  ],
  external: Object.keys(pkg.peerDependencies || {}),
  plugins: [
    resolve(),
    commonjs({
      exclude: [
        "src/**",
        "../../node_modules/lodash-es/**",
        "../../node_modules/symbol-observable/es/**",
      ],
      include: ["../../node_modules/**"],
      namedExports: {
        "../../node_modules/react-redux/node_modules/react-is/index.js": [
          "isValidElementType",
          "isContextConsumer",
        ],
        "../../node_modules/@material-ui/utils/node_modules/react-is/index.js": [
          "ForwardRef",
          "Memo",
        ],
        "../../node_modules/react-dom/index.js": [
          "findDOMNode",
          "unstable_batchedUpdates",
        ],
        "../../node_modules/react-is/index.js": [
          "isValidElementType",
          "isElement",
          "ForwardRef",
          "typeOf",
          "Memo",
          "isContextConsumer",
        ],
        "../../node_modules/prop-types/index.js": ["element", "elementType"],
      },
    }),
    babel({
      exclude: "../../node_modules/**",
    }),
    postcss(),
  ],
};
