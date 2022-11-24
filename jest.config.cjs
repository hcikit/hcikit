/** @type {import('@ts-jest/dist/types').InitialOptionsTsJest} */
const testDefault = {
  preset: "ts-jest/presets/default-esm", // or other ESM presets
  // globals: {
  //   "ts-jest": {
  //     useESM: true,
  //   },
  // },
  transform: {
    // '^.+\\.[tj]sx?$' to process js/ts with `ts-jest`
    // '^.+\\.m?[tj]sx?$' to process js/ts/mjs/mts with `ts-jest`
    "^.+\\.tsx?$": [
      "ts-jest",
      {
        useESM: true,
      },
    ],
  },
  moduleNameMapper: {
    "^(\\.{1,2}/.*)\\.js$": "$1",
  },
  testEnvironment: "jsdom",
  setupFilesAfterEnv: ["@testing-library/jest-dom/extend-expect"],
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
