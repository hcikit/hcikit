/** @type {import('@ts-jest/dist/types').InitialOptionsTsJest} */
module.exports = {
  preset: "ts-jest",
  testEnvironment: "jsdom",
  moduleNameMapper: {
    "@hcikit/workflow(.*)$": "<rootDir>/../workflow/src$1",
  },
  testMatch: ["./src/**/*.[jt]s?(x)", "**/?(*.)+(spec|test).[t]s?(x)"],
  modulePathIgnorePatterns: ["./dist/", "./node_modules/"],
  testPathIgnorePatterns: ["./dist/", "./node_modules/"],
  transformIgnorePatterns: ["./dist/", "/node_modules/"],
  setupFilesAfterEnv: ["<rootDir>/setupTests.ts"],
  collectCoverageFrom: [
    "src/**/*.{ts,tsx}",
    "!/node_modules/",
    "!src/setupTests.ts",
    "!src/**/*.stories.{js,ts,tsx,jsx}",
  ],
};
