/* eslint-disable @typescript-eslint/no-var-requires */
const path = require('path')
const VueSSRServerPlugin = require('vue-server-renderer/server-plugin')
const baseConfig = require('./webpack.base.config')
const { merge } = require('webpack-merge')
const webpack = require('webpack')

const config = (env, argv) =>
  merge(baseConfig(env, argv), {
    entry: path.join(__dirname, '../src/entry-server.ts'),
    target: 'node',
    output: {
      libraryTarget: 'commonjs2'
    },
    plugins: [
      new VueSSRServerPlugin(),
      new webpack.optimize.LimitChunkCountPlugin({
        maxChunks: 1
      })
    ]
  })

module.exports = config
