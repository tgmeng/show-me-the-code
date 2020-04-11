const TsconfigPathsPlugin = require('tsconfig-paths-webpack-plugin');
const MonacoWebpackPlugin = require('monaco-editor-webpack-plugin');
const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin');

const babelLoader = {
  loader: 'babel-loader',
  options: {},
};

module.exports = (env, options) => {
  return {
    module: {
      rules: [
        {
          oneOf: [
            {
              test: /\.jsx?$/,
              exclude: /node_modules/,
              use: [babelLoader],
            },
            {
              test: /\.tsx?$/,
              exclude: /node_modules/,
              use: [
                babelLoader,
                {
                  loader: 'ts-loader',
                  options: {
                    transpileOnly: true,
                  },
                },
              ],
            },
            {
              test: /\.css$/,
              use: ['style-loader', 'css-loader'],
            },
            {
              test: /\.ttf$/,
              use: ['file-loader'],
            },
          ],
        },
      ],
    },
    resolve: {
      extensions: ['.tsx', '.ts', '.js', '.jsx'],
      plugins: [new TsconfigPathsPlugin()],
    },
    plugins: [
      new MonacoWebpackPlugin(),
      new ForkTsCheckerWebpackPlugin({
        eslint: true,
      }),
    ],
  };
};
