import babel from "rollup-plugin-babel";
import commonjs from "rollup-plugin-commonjs";
import resolve from "rollup-plugin-node-resolve";
import pkg from "./package.json";
import postcss from "rollup-plugin-postcss";

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
  external: Object.keys(pkg.peerDependencies || {}),
  plugins: [
    resolve(),
    commonjs({
      exclude: ["src/**"],
      include: ["../../node_modules/**"],
      namedExports: {
        "../../node_modules/react-redux/node_modules/react-is/index.js": [
          "isValidElementType",
          "isContextConsumer"
        ],
        "../../node_modules/react-dom/index.js": ["findDOMNode"],
        "../../node_modules/react-is/index.js": [
          "isValidElementType",
          "isElement",
          "ForwardRef"
        ],
        "../../node_modules/prop-types/index.js": ["element", "elementType"]
      }
    }),
    babel({
      exclude: "../../node_modules/**"
    }),
    postcss()
  ]
};
