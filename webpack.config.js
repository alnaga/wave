const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

const environment = process.env.NODE_ENV;
const isProd = environment === 'production';

module.exports = {
  entry: './src/index.jsx',
  mode: environment,
  devServer: {
    contentBase: './build',
    hot: true,
    port: 8080
  },
  devtool: !isProd ? 'source-map' : undefined,
  module: {
    rules: [
      {
        test: /.(js|jsx)$/,
        use: ['babel-loader'],
        exclude: /(node_modules|api)$/
      },
      {
        test: /.css$/,
        use: [
           MiniCssExtractPlugin.loader,
          'css-loader'
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
    }),
    new MiniCssExtractPlugin({
      filename: '[name].css'
    })
  ],
  resolve: {
    extensions: ['.js', '.jsx']
  }
};
