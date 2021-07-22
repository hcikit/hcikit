/** @type {import('@ts-jest/dist/types').InitialOptionsTsJest} */
module.exports = {
  preset: "ts-jest/presets/js-with-ts",
  // testEnvironment: "jsdom",
  // moduleNameMapper: {
  //   // "@hcikit/example(.*)$": "<rootDir>/./example/src/$1",
  //   "@hcikit/workflow(.*)$": "<rootDir>/packages/./workflow/src/$1",
  //   "@hcikit/react(.*)$": "<rootDir>/packages/./react/src/$1",
  // },
  // modulePathIgnorePatterns: ["/dist/", "/node_modules/"],
  // testPathIgnorePatterns: ["/dist/", "/node_modules/"],
  // transformIgnorePatterns: ["/dist/", "/node_modules/"],
  projects: [
    "<rootDir>/packages/react",
    "<rootDir>/packages/workflow",
    "<rootDir>/example",
  ],
  // collectCoverageFrom: [
  //   "src/**/*.{js,jsx}",
  //   "!/node_modules/",
  //   "!src/registerServiceWorker.js",
  //   "!src/stories/*",
  //   "!src/experiments/*",
  //   "!src/setupTests.js",
  //   "!src/**/*.stories.js",
  // ],
};
