/** @type {import('@ts-jest/dist/types').InitialOptionsTsJest} */
module.exports = {
  testEnvironment: "jsdom",
  modulePathIgnorePatterns: ["./dist/", "./node_modules/"],
  testPathIgnorePatterns: ["./dist/", "./node_modules/"],
  transformIgnorePatterns: [
    "./dist/",
    "./node_modules/",
    "<rootDir>/src/setupTests.js",
  ],
  setupFilesAfterEnv: ["<rootDir>/src/setupTests.js"],
  collectCoverageFrom: [
    "src/**/*.{ts,tsx}",
    "!/node_modules/",
    "!src/setupTests.ts",
    "!src/**/*.stories.{js,ts,tsx,jsx}",
  ],
  transform: {
    "\\.[jt]sx?$": "babel-jest",
    "<rootDir>/src/setupTests.js": "babel-jest",
  },
};
