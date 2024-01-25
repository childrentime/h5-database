const express = require("express");
const webpack = require("webpack");
const { APP_PATH, serverConfig } = require("../configs/webpack.server.config");
const clearModule = require("clear-module");
const webpackDevMiddleware = require("webpack-dev-middleware");
const webpackHotMiddleware = require("webpack-hot-middleware");
const ReactRefreshWebpackPlugin = require("@pmmmwh/react-refresh-webpack-plugin");
const { clientConfig } = require("../configs/webpack.client.config");
const path = require("path");

const port = process.env.PORT || 4000;
const cwd = process.cwd();

const hotMiddlewareScript = `${require.resolve('webpack-hot-middleware/client')}?path=/__webpack_hmr&timeout=20000&reload=true&noInfo=true`;

const dev = () => {
  let app;
  let initialized = false;
  const server = express();

  process.on("uncaughtException", (e) => {
    console.error("uncaughtException", e);
  });
  process.on("unhandledRejection", (e) => {
    console.info("unhandledRejection:", e);
  });

  clientConfig.plugins.push(new webpack.HotModuleReplacementPlugin());
  Object.keys(clientConfig.entry).forEach(function (name) {
    clientConfig.entry[name].unshift(hotMiddlewareScript);
  });
  clientConfig.plugins.push(
    new ReactRefreshWebpackPlugin({
      overlay: {
        sockIntegration: "whm",
      },
    })
  );

  const clientCompiler = webpack(clientConfig);

  const devMiddleware = webpackDevMiddleware(clientCompiler, {
    publicPath: "/",
    writeToDisk(filePath) {
      return /\webpack-assets.json?$/.test(filePath);
    },
    stats: {
      all: false,
      env: true,
      errors: true,
      errorDetails: true,
      timings: true,
    },
  });

  const hotMiddleware = webpackHotMiddleware(clientCompiler, {
    log: (message) => {
      console.log("HMR LOGGER: ", message);
    },
    heartbeat: 2000,
  });

  server.use("/", express.static(path.join(cwd, "./dist")));
  server.use(devMiddleware);
  server.use(hotMiddleware);

  webpack(serverConfig).watch({ aggregateTimeout: 300 }, (errors, stats) => {
    console.log(stats.toString())
    const error = errors || stats.compilation.errors;
    if (error && error.length) {
      console.log(error);
      throw errors;
    } else {
      console.log(stats.toString());
    }

    if (initialized) {
      clearModule(APP_PATH);
      app = require(APP_PATH).app;

      console.log(`server is listening on port: http://localhost:${port}`);
    } else {
      console.log(`starting app at ${new Date().toLocaleString()}`);

      app = require(APP_PATH).app;

      server.use((req, res, next) => {
        app.handle(req, res, next);
      });

      server.listen(port, () => {
        console.log(`server is listening on port: http://localhost:${port}`);
      });

      initialized = true;
    }
  });
};

module.exports = {
  dev,
};
