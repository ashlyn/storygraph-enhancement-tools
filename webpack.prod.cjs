const { merge } = require('webpack-merge');
const common = require('./webpack.common.cjs');

module.exports = (env) => merge(common(env), {
  mode: 'production',
  devtool: 'source-map',
});