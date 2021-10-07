/* eslint-env node */
const path = require('path')
const webpack = require('webpack')
const { CleanWebpackPlugin } = require('clean-webpack-plugin')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const CopyWebpackPlugin = require('copy-webpack-plugin')


module.exports = {
  entry: {
    app: [
      path.resolve(__dirname, 'src/main.ts')
    ],
  },
  output: {
    path: path.resolve(__dirname, 'build'),
    publicPath: './',
    filename: 'js/[name].bundle.js'
  },
  plugins: [
    new webpack.DefinePlugin({
      __DEV__: JSON.stringify(JSON.parse(process.env.BUILD_DEV || 'false')),
      WEBGL_RENDERER: true, // I did this to make webpack work, but I'm not really sure it should always be true
      CANVAS_RENDERER: true // I did this to make webpack work, but I'm not really sure it should always be true
    }),
    new CleanWebpackPlugin({ cleanAfterEveryBuildPatterns: ['build'] }),
    new webpack.IgnorePlugin({
      resourceRegExp: /^\.\/locale$|moment$/
    }),
    //new webpack.optimize.CommonsChunkPlugin({ name: 'vendor' /* chunkName= */, filename: 'js/vendor.bundle.js' /* filename= */ }),
    new HtmlWebpackPlugin({
      filename: 'index.html', // path.resolve(__dirname, 'build', 'index.html'),
      template: './src/index.html',
      chunks: ['app'],
      chunksSortMode: 'manual',
      minify: {
        removeAttributeQuotes: true,
        collapseWhitespace: true,
        html5: true,
        minifyCSS: true,
        minifyJS: true,
        minifyURLs: true,
        removeComments: true,
        removeEmptyAttributes: true
      },
      hash: true
    }),
    new CopyWebpackPlugin({
      patterns: [
        { from: 'assets', to: 'assets' },
      ]
    }),
  ],
  module: {
    rules: [
      { test: /\.ts$/, use: ['babel-loader'], include: path.join(__dirname, 'src') },
      { test: /phaser-split\.js$/, use: 'raw-loader' },
      { test: [/\.vert$/, /\.frag$/, /\.txt$/], use: 'raw-loader' }
    ]
  },
  optimization: {
    minimize: true,
    splitChunks: {
      //chunks: 'all'
    }
  },
  resolve: {
    extensions: ['.ts', '.js', '.json']
  }
  /*node: {
    fs: 'empty',
    net: 'empty',
    tls: 'empty'
  },
  */
}