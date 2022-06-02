/* eslint-disable @typescript-eslint/no-var-requires */
const webpack = require('webpack');
const path = require('path');
const nodeExternals = require('webpack-node-externals');

const baseConfig = {
  mode: 'production',
  entry: './src/index.ts',
  devtool: 'source-map',
  resolve: {
    extensions: ['.ts', '.js'],
  },
  plugins: [
    new webpack.BannerPlugin({
      banner: "#!/usr/bin/env -S node --no-deprecation",
      raw: true
    }),
  ],
  module: {
    rules: [
      { test: /\.tsx?$/, loader: 'ts-loader' }
    ]
  }
};

module.exports = {
  ...baseConfig,
  output: {
    filename: 'index.js',
    path: path.resolve(__dirname, 'dist'),
    library: {
      type: 'commonjs'
    },
  },
  target: 'node',
  externalsPresets: { node: true },
  externals: [
    nodeExternals({
      allowlist: ['node-fetch']
    })
  ],
};
