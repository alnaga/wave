const path = require('path');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const WorkboxPlugin = require('workbox-webpack-plugin');
const autoprefixer = require('autoprefixer');
const precss = require('precss');

const environment = process.env.NODE_ENV;
const isProd = environment === 'production';

module.exports = {
  entry: './src/index.jsx',
  mode: environment,
  devServer: {
    contentBase: './build',
    historyApiFallback: {
      index: '/'
    },
    hot: !isProd,
    port: 8080,
    publicPath: '/'
  },
  devtool: !isProd ? 'eval' : undefined,
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        use: [{
          loader: 'babel-loader',
          options: {
            compact: false
          }
        }],
        exclude: /(node_modules|api)$/
      },
      {
        test: /\.scss$/,
        use: [
          'style-loader',
          'css-loader',
          {
            loader: 'postcss-loader',
            options: {
              postcssOptions: {
                plugins: [
                  autoprefixer,
                  precss
                ]
              }
            }
          },
          {
            loader: 'fast-sass-loader',
            options: {
              implementation: require('node-sass')
            }
          }
        ]
      }
    ]
  },
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'build'),
    publicPath: '/'
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: path.resolve(__dirname, 'src', 'index.html')
    }),
    new CopyWebpackPlugin({
      patterns: [
        {
          from: './src/manifest.json',
          to: './manifest.json'
        },
        {
          from: './src/wave-icon.png',
          to: './wave-icon.png'
        },
        {
          from: './src/wave-splashscreen.png',
          to: './wave-splashscreen.png'
        },
        {
          from: './src/favicon.ico',
          to: './favicon.ico'
        },
        {
          from: './src/apple-touch-icon.png',
          to: './apple-touch-icon.png'
        },
        {
          from: './src/wave-ios.p12',
          to: './wave-ios.p12'
        }
      ]
    }),
    new WorkboxPlugin.GenerateSW({
      clientsClaim: true,
      skipWaiting: true
    })
  ],
  resolve: {
    extensions: ['.js', '.jsx']
  }
};
