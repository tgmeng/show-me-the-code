module.exports = {
  presets: ['@babel/env', '@babel/preset-react'],
  plugins: ['react-hot-loader/babel'],
  env: {
    production: {
      plugins: ['emotion'],
    },
    development: {
      plugins: [['emotion', { sourceMap: true }]],
    },
  },
};
