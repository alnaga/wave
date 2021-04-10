const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const autoprefixer = require('autoprefixer');
const precss = require('precss');

const environment = process.env.NODE_ENV;
const isProd = environment === 'production';

module.exports = {
  entry: './src/index.jsx',
  mode: environment,
  devServer: {
    contentBase: './build',
    hot: !isProd,
    port: 8080
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
    path: path.resolve(__dirname, 'build')
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: path.resolve(__dirname, 'src', 'index.html')
    })
  ],
  resolve: {
    extensions: ['.js', '.jsx']
  }
};
