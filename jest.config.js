module.exports = {
  projects: ["./example/", "./packages/react", "./packages/workflow"],
  collectCoverageFrom: [
    "src/**/*.{js,jsx}",
    "!/node_modules/",
    "!src/registerServiceWorker.js",
    "!src/stories/*",
    "!src/experiments/*",
    "!src/setupTests.js",
    "!src/**/*.stories.js"
  ],
  transformIgnorePatterns: ["/node_modules/(?!lodash-es).+\\.js$"]
};
