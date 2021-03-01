/* eslint-disable @typescript-eslint/no-var-requires */
const path = require('path')
const VueLoaderPlugin = require('vue-loader/lib/plugin')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const TerserPlugin = require('terser-webpack-plugin')
const OptimizeCSSAssetsPlugin = require('optimize-css-assets-webpack-plugin')

const config = (env, argv) => {
  const isProduction = argv.mode === 'production'
  return {
    entry: {
      app: path.join(__dirname, '../src/entry-client.ts')
      // vendor: ['es6-promise', 'vue', 'vue-router', 'vuex', 'vuex-router-sync']
    },
    output: {
      filename: '[name].js',
      path: path.join(__dirname, '../dist'),
      publicPath: '/dist/'
    },
    optimization: {
      minimizer: isProduction
        ? [
            new TerserPlugin({
              terserOptions: {
                compress: {
                  drop_console: true
                },
                output: {
                  comments: false
                }
              }
            }),
            new OptimizeCSSAssetsPlugin({
              discardComments: { removeAll: true }
            })
          ]
        : []
    },
    devtool: isProduction ? 'none' : 'source-map',
    module: {
      rules: [
        {
          test: /\.(png|jpe?g|gif)$/i,
          use: [
            {
              loader: 'file-loader',
              options: {
                esModule: false,
                name: 'assets/[name].[contenthash].[ext]'
              }
            }
          ]
        },
        {
          test: /\.svg$/i,
          use: [
            {
              loader: 'file-loader',
              options: {
                esModule: false,
                name: 'assets/[name].[contenthash].[ext]'
              }
            }
          ]
        },
        {
          test: /\.(woff|woff2|eot|ttf)$/,
          use: ['url-loader']
        },
        {
          test: /\.vue$/,
          loader: 'vue-loader',
          options: {
            extractCSS: isProduction
          }
        },
        {
          test: /\.tsx?$/,
          exclude: /node_modules/,
          use: [
            {
              loader: 'ts-loader',
              options: {
                transpileOnly: true /* コンパイルのみで型検査を行わない */,
                appendTsSuffixTo: [
                  /\.vue$/
                ] /* .vueファイルをTSとして読み込むようにする */
              }
            }
          ]
        },
        {
          test: /\.m?js$/,
          exclude: /node_modules/,
          loader: 'babel-loader'
        },
        {
          test: /\.s?(c|a)ss$/,
          sideEffects: true,
          use: [
            isProduction
              ? {
                  loader: MiniCssExtractPlugin.loader
                }
              : 'vue-style-loader',
            'css-loader',
            {
              loader: 'sass-loader',
              // Requires sass-loader@^8.0.0
              options: {
                implementation: require('sass'),
                sassOptions: {
                  fiber: require('fibers')
                }
              }
            }
          ]
        }
      ]
    },
    plugins: [
      new VueLoaderPlugin(),
      ...(isProduction
        ? [
            new MiniCssExtractPlugin({
              filename: 'style/style.min.css'
            })
          ]
        : [])
    ],
    resolve: {
      extensions: ['.ts', '.js', '.vue'],
      alias: {
        '@': path.resolve(__dirname, '../src')
      }
    }
  }
}

module.exports = config
