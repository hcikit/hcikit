module.exports = {
  parser: "@typescript-eslint/parser",
  parserOptions: {
    tsconfigRootDir: __dirname,
    project: ["./tsconfig.json", "./packages/*/tsconfig.json"],
  },
  extends: [
    "eslint:recommended",
    "standard",
    "prettier",
    "plugin:@typescript-eslint/recommended",
    "prettier/@typescript-eslint",
  ],
  plugins: ["@typescript-eslint"],
  ignorePatterns: ["dist", "node_modules", "scripts"],
};
