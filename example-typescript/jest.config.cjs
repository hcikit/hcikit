/** @type {import('@ts-jest/dist/types').InitialOptionsTsJest} */
module.exports = {
  preset: "ts-jest",
  testEnvironment: "jsdom",
  modulePathIgnorePatterns: ["/dist/", "/node_modules/"],
  testPathIgnorePatterns: ["/dist/", "/node_modules/"],
  transformIgnorePatterns: ["/dist/", "/node_modules/"],
  collectCoverageFrom: [
    "src/**/*.{ts,tsx}",
    "!/node_modules/",
    "!src/setupTests.ts",
  ],
  setupFilesAfterEnv: ["<rootDir>/src/setupTests.ts"],
};
