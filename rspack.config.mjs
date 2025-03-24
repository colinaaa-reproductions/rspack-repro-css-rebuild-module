import path from "path";
import { fileURLToPath } from "url";
import { rspack } from "@rspack/core";
import MiniCssExtractPlugin from "mini-css-extract-plugin";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const isRunningWebpack = !!process.env.WEBPACK;
const isRunningRspack = !!process.env.RSPACK;
if (!isRunningRspack && !isRunningWebpack) {
  throw new Error("Unknown bundler");
}

const CssExtractPlugin = isRunningRspack
  ? rspack.CssExtractRspackPlugin
  : MiniCssExtractPlugin;

/**
 * @type {import('webpack').Configuration | import('@rspack/cli').Configuration}
 */
const config = {
  mode: "development",
  devtool: false,
  entry: {
    main: "./src/index",
  },
  target: 'node',
  output: {
    clean: true,
    path: isRunningWebpack
      ? path.resolve(__dirname, "webpack-dist")
      : path.resolve(__dirname, "rspack-dist"),
    filename: "[name].js",
    publicPath: '/',
  },
  module: {
    rules: [
      {
        test: /\.css$/,
        use: [
          // 'style-loader',
          CssExtractPlugin.loader,
          "css-loader",
          "./loader.js",
        ],
        type: 'javascript/auto',
      },
    ],
  },
  plugins: [
    new CssExtractPlugin({
      experimentalUseImportModule: false,
    }),
    /**
     * @param {import('@rspack/core').Compiler} compiler
     */
    (compiler) => {
      let initial = true;
      compiler.hooks.thisCompilation.tap("test", (compilation) => {
        compilation.hooks.finishModules.tapAsync(
          "test",
          (modules, callback) => {
            if (!initial) {
              return callback();
            }
            initial = false;

            const cssModule = Array.from(modules).find((module) =>
              module.resource.includes(".css")
            );

            console.log("rebuild module", cssModule.resource);
            compilation.rebuildModule(cssModule, callback);
          }
        );
      });
    },
  ],
};

export default config;
