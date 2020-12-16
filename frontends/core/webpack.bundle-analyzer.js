/* eslint-disable @typescript-eslint/no-var-requires */
const { merge } = require('webpack-merge')
const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer')
const prod = require('./webpack.prod.js')

module.exports = merge(prod, {
  plugins: [new BundleAnalyzerPlugin()],
})
