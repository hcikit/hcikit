import babel from "rollup-plugin-babel";
import json from "rollup-plugin-json";
import commonjs from "rollup-plugin-commonjs";
import external from "rollup-plugin-peer-deps-external";
import postcss from "rollup-plugin-postcss";
import resolve from "rollup-plugin-node-resolve";
import url from "rollup-plugin-url";
import builtins from "rollup-plugin-node-builtins";
import pkg from "./package.json";

export default {
  input: "src/index.js",
  output: [
    {
      file: pkg.main,
      format: "cjs",
      sourcemap: true
    },
    {
      file: pkg.module,
      format: "es",
      sourcemap: true
    }
  ],
  plugins: [
    builtins(),
    external(),
    postcss({
      modules: true
    }),
    url(),
    babel({
      exclude: "node_modules/**"
    }),
    resolve(),
    json(),
    commonjs({
      namedExports: {
        "../../node_modules/react-redux/node_modules/react-is/index.js": [
          "isValidElementType",
          "isContextConsumer"
        ],

        "../../node_modules/react-is/index.js": [
          "isValidElementType",
          "isElement",
          "ForwardRef"
        ]
      }
    })
  ]
};
