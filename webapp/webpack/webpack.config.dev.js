const webpack = require('webpack');
const merge = require('webpack-merge');

const commonConfig = require('./webpack.config.common');

module.exports = (env, options) => {
  return merge(commonConfig(env, options), {
    mode: 'development',
    devtool: 'inline-source-map',
    entry: ['react-hot-loader/patch', './src/index.tsx'],
    devServer: {
      hot: true,
      hotOnly: true,
      headers: {
        'Access-Control-Allow-Origin': '*',
      },
    },
    output: {
      filename: 'app.js',
      publicPath: 'http://localhost:8080/',
    },
    resolve: {
      alias: {
        'react-dom': '@hot-loader/react-dom',
      },
    },
    plugins: [new webpack.HotModuleReplacementPlugin()],
  });
};
