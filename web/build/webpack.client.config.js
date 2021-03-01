/* eslint-disable @typescript-eslint/no-var-requires */
const webpack = require('webpack')
const baseConfig = require('./webpack.base.config')
const { merge } = require('webpack-merge')
const VueSSRClientPlugin = require('vue-server-renderer/client-plugin')

module.exports = (env, argv) =>
  merge(baseConfig(env, argv), {
    optimization: {
      splitChunks: {
        name: 'manifest',
        minChunks: Infinity
      }
    },
    plugins: [new VueSSRClientPlugin()]
  })
