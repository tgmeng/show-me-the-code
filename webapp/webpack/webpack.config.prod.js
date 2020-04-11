const path = require('path');
const merge = require('webpack-merge');

const commonConfig = require('./webpack.config.common');

module.exports = (env, options) => {
  return merge(commonConfig(env, options), {
    entry: './src/index.tsx',
    mode: 'production',
    devtool: 'eval',
    output: {
      path: path.resolve(__dirname, '../../priv/static/js'),
      publicPath: '/js/',
      filename: 'app.js',
    },
  });
};
