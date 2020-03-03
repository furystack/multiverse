const path = require('path')
const webpack = require('webpack')
// const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const { getAllEnvVariables } = require('sites')

module.exports = {
  mode: 'production', // "development",
  entry: './src/index.tsx',
  output: {
    filename: '[name].bundle.js',
    chunkFilename: '[name].bundle.js',
    publicPath: '/',
    path: path.resolve(`${__dirname}/bundle`),
  },
  devServer: {
    historyApiFallback: true,
    disableHostCheck: true,
  },
  optimization: {
    splitChunks: {
      chunks: 'all',
      cacheGroups: {
        commons: {
          minChunks: 2,
          name: 'vendors',
          chunks: 'all',
        },
        furystack: {
          test: /([\\/]node_modules[\\/]@furystack[\\/]|[\\/]furystack[\\/]packages[\\/])/gm,
          name: 'furystack',
          chunks: 'all',
        },
      },
    },
    runtimeChunk: false,
  },
  // Enable sourcemaps for debugging webpack's output.
  devtool: 'eval-source-map', // 'source-map',
  resolve: {
    // Add '.ts' and '.tsx' as resolvable extensions.
    extensions: ['.ts', '.tsx', '.js', '.json'],
  },
  plugins: [
    // new BundleAnalyzerPlugin({ analyzerPort: 8745 }),
    new HtmlWebpackPlugin({
      template: './index.html',
    }),
    new webpack.EnvironmentPlugin({
      NODE_ENV: 'development',
      DEBUG: true,
      APP_VERSION: require('./package.json').version,
      BUILD_DATE: new Date().toISOString(),
      ...getAllEnvVariables(),
    }),
  ],
  module: {
    rules: [
      // All files with a '.ts' or '.tsx' extension will be handled by 'awesome-typescript-loader'.
      // { test: /\.tsx?$/, loader: 'awesome-typescript-loader' },
      { test: /\.tsx?$/, loader: 'ts-loader' },
      // All output '.js' files will have any sourcemaps re-processed by 'source-map-loader'.
      {
        enforce: 'pre',
        test: /\.js$/,
        loader: 'source-map-loader',
        exclude: /monaco-editor/,
      },
      {
        test: /\.css$/,
        use: [
          require.resolve('style-loader'),
          {
            loader: require.resolve('css-loader'),
            options: {
              importLoaders: 1,
            },
          },
        ],
      },
      {
        test: [/\.bmp$/, /\.gif$/, /\.jpe?g$/, /\.png$/, /\.PNG$/, /\.svg$/, /\.eot$/, /\.woff$/, /\.woff2$/, /\.ttf$/],
        loader: require.resolve('url-loader'),
        options: {
          limit: 10000,
          name: 'static/media/[name].[hash:8].[ext]',
        },
      },
    ],
  },
}
