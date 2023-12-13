const AssetsPlugin = require("assets-webpack-plugin");
const Webpackbar = require("webpackbar");
const path = require("path");
const babelConfig = require("./babel.config");
const { getClientEntries } = require("./entry");

const cwd = process.cwd();

const cssLoader = (modules) => {
  return {
    loader: require.resolve("css-loader"),
    options: {
      importLoaders: 1,
      modules: modules
        ? {
            localIdentName:
              process.env.NODE_ENV === "development"
                ? "[local]-[hash:base64:5]"
                : "[hash:base64:8]",
          }
        : "global",
      sourceMap: true,
      esModule: false,
    },
  };
};

const sassLoader = {
  loader: require.resolve("sass-loader"),
};

const postCssLoader = {
  loader: require.resolve("postcss-loader"),
};

const moduleScssReg = /\.(module|iso|mjs)\.scss$/;

const styleLoader = { loader: require.resolve("../useStyles/loader/index.js") };

const /**
   * @type {import("webpack").Configuration}
   */ clientConfig = {
    mode: process.env.NODE_ENV || "development",
    node: false,
    entry: getClientEntries(),
    output: {
      path: path.resolve(cwd, "dist"),
      filename: "assets/js/[name].bundle.js",
      chunkFilename: "assets/js/[id].chunk.js",
      publicPath: "/",
      environment: {
        arrowFunction: false,
        bigIntLiteral: false,
        const: false,
        destructuring: false,
        dynamicImport: false,
        forOf: false,
        module: false,
      },
    },
    devtool: "eval-cheap-module-source-map",
    module: {
      rules: [
        {
          test: /\.(js|jsx|ts|tsx)$/,
          exclude: /node_modules/,
          use: [
            {
              loader: require.resolve("babel-loader"),
              options: babelConfig(true),
            },
          ],
        },
        {
          test: /\.css$/,
          use: [styleLoader, cssLoader(), postCssLoader],
          exclude: /\.module\.css$/,
        },
        {
          test: /\.scss$/,
          use: [styleLoader, cssLoader(), postCssLoader, sassLoader],
          exclude: moduleScssReg,
        },
        {
          test: /\.module\.css$/,
          use: [styleLoader, cssLoader(true), postCssLoader],
        },
        {
          test: moduleScssReg,
          use: [styleLoader, cssLoader(true), postCssLoader, sassLoader],
        },
      ],
    },
    resolve: {
      extensions: [".js", ".jsx", ".json", ".mjs", ".wasm", ".ts", ".tsx"],
    },
    plugins: [
      new AssetsPlugin({
        path: path.join(cwd, "dist"),
        entrypoints: true,
      }),
      new Webpackbar({ name: "client" }),
    ],
    cache: {
      type: "filesystem",
      buildDependencies: {
        config: [__filename, path.resolve(cwd, "package.json")],
      },
      cacheDirectory: path.resolve(cwd, "node_modules/.webpackCache"),
      name: "client",
    },
  };

module.exports = { clientConfig };
