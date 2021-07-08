module.exports = function (api) {
  api.cache(true);

  return {
    presets: ["@babel/preset-env", "@babel/preset-typescript"],
    plugins: [
      ["@babel/plugin-proposal-class-properties", { loose: false }],
      [
        "@babel/plugin-transform-runtime",
        {
          absoluteRuntime: false,
          corejs: false,
          helpers: true,
          regenerator: true,
          useESModules: true,
        },
      ],
    ],
  };
};
