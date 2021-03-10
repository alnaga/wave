const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

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
  module: {
    rules: [
      {
        test: /.(js|jsx)$/,
        use: ['babel-loader'],
        exclude: /node_modules$/
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
