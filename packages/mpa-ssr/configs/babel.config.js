const babelConfig = (isWebTarget) => {
  return {
    presets: [
      [
        "@babel/preset-env",
        {
          useBuiltIns: "usage",
          modules: "commonjs",
          corejs: 2,
          targets: {
            node: "current",
          },
        },
      ],
      [
        "@babel/preset-react",
        {
          runtime: "automatic",
        },
      ],
      "@babel/preset-typescript",
    ],
    plugins: [
      ["@babel/plugin-proposal-decorators",{
        "version": "2023-05"
      }],
      ["@babel/plugin-transform-class-static-block"]
      ["@babel/plugin-proposal-class-properties", { loose: false }],
      process.env.NODE_ENV !== "production" &&
        isWebTarget &&
        "react-refresh/babel",
    ].filter(Boolean),
  };
};

module.exports = babelConfig;
