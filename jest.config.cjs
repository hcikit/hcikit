/** @type {import('@ts-jest/dist/types').InitialOptionsTsJest} */

const testDefault = {
  preset: "ts-jest/presets/default-esm", // or other ESM presets
  globals: {
    "ts-jest": {
      useESM: true,
    },
  },
  moduleNameMapper: {
    "^(\\.{1,2}/.*)\\.js$": "$1",
    "markdown-to-jsx":
      "<rootDir>/node_modules/markdown-to-jsx/dist/index.module.js",
  },
};

module.exports = {
  projects: [
    {
      ...testDefault,

      displayName: "@hcikit/react",
      roots: ["<rootDir>/packages/react"],
    },
    {
      ...testDefault,

      displayName: "@hcikit/workflow",
      roots: ["<rootDir>/packages/workflow"],
    },
    {
      ...testDefault,
      displayName: "@hcikit/example",
      testMatch: ["<rootDir>/example"],
    },
    {
      ...testDefault,

      displayName: "@hcikit/example-typescript",
      roots: ["<rootDir>/example-typescript"],
    },
  ],
};
