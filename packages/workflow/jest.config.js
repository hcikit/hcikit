module.exports = {
  collectCoverageFrom: [
    "src/**/*.{js,jsx}",
    "!/node_modules/",
    "!src/registerServiceWorker.js",
    "!src/stories/*",
    "!src/experiments/*",
    "!src/setupTests.js",
    "!src/**/*.stories.js",
  ],
  transformIgnorePatterns: [
    "../../node_modules/(?!lodash-es|@babel/runtime).+\\.js$",
  ],
  transform: {
    "^.+\\.[t|j]sx?$": "babel-jest",
  },
};
