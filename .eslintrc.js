module.exports = {
  parser: "babel-eslint",
  extends: [
    "eslint:recommended",
    "plugin:import/recommended",
    "plugin:react/recommended",
    "plugin:prettier/recommended"
  ],
  env: {
    es6: true,
    jest: true,
    browser: true,
    node: true
  },
  settings: {
    react: {
      version: "detect"
    }
  },
  plugins: ["react", "jest", "import"],
  parserOptions: {
    sourceType: "module"
  }
};
