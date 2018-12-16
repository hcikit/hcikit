import babel from 'rollup-plugin-babel'
import commonjs from 'rollup-plugin-commonjs'
import external from 'rollup-plugin-peer-deps-external'
import postcss from 'rollup-plugin-postcss'
import resolve from 'rollup-plugin-node-resolve'
import url from 'rollup-plugin-url'
import builtins from 'rollup-plugin-node-builtins'
import pkg from './package.json'

export default {
  input: 'src/index.js',
  output: [
    {
      file: pkg.main,
      format: 'cjs',
      sourcemap: true
    },
    {
      file: pkg.module,
      format: 'es',
      sourcemap: true
    }
  ],
  'output.globals': { 'styled-components': 'styled' },
  plugins: [
    builtins(),
    external(),
    postcss({
      modules: true
    }),
    url(),
    babel({
      exclude: 'node_modules/**'
    }),
    resolve(),
    commonjs({
      namedExports: {
        'node_modules/lodash/lodash.js': [
          'throttle',
          'uniqBy',
          'filter',
          'map',
          'isEqual',
          'mapValues',
          'noop',
          'last',
          'sum',
          'pickBy',
          'merge',
          'range',
          'pick'
        ],

        'node_modules/react-redux/node_modules/react-is/index.js': [
          'isValidElementType'
        ],
        'node_modules/react-is/index.js': ['isValidElementType']
        // 'node_modules/@material-ui/core/styles/index.js': [
        //   'createGenerateClassName',
        //   'createMuiTheme',
        //   'createStyles',
        //   'jssPreset',
        //   'MuiThemeProvider',
        //   'withStyles',
        //   'withTheme'
        // ]
      }
    })
  ]
}
