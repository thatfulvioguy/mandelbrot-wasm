
const path = require('path')

/* eslint-env node */

module.exports = {
  entry: './src/bootstrapper.js',
  output: {
    filename: 'bootstrapper.js',
    path: path.resolve(__dirname, 'dist')
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            cacheDirectory: true
          }
        }
      },

      // TODO don't inline CSS into the bundle. is it the extract-text plugin we're after?
      {
        test: /\.css$/,
        use: [
          'style-loader',
          'css-loader'
        ]
      }
    ]
  }
}
