/* eslint-disable @typescript-eslint/no-var-requires */
const path = require('path')
const webpack = require('webpack')
// const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const { sites, tokens } = require('common-config')
const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin')

module.exports = {
  context: process.cwd(),
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
    hot: false,
    inline: false,
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
  devtool: 'source-map',
  resolve: {
    // Add '.ts' and '.tsx' as resolvable extensions.
    extensions: ['.ts', '.tsx', '.js', '.json'],
  },
  plugins: [
    new ForkTsCheckerWebpackPlugin({
      eslint: true,
    }),
    // new BundleAnalyzerPlugin({ analyzerPort: 8745 }),
    new HtmlWebpackPlugin({
      template: './index.html',
    }),
    new webpack.EnvironmentPlugin({
      NODE_ENV: 'development',
      DEBUG: true,
      APP_VERSION: require('./package.json').version,
      BUILD_DATE: new Date().toISOString(),
      WRAPPR_SERVICE_INTERNAL_PORT: process.env.WRAPPR_SERVICE_INTERNAL_PORT || sites.services['wrap-r'].internalPort,
      WRAPPR_SERVICE_EXTENRAL_URL: process.env.WRAPPR_SERVICE_EXTENRAL_URL || sites.services['wrap-r'].externalPath,
      LOGGR_SERVICE_INTERNAL_PORT: process.env.LOGGR_SERVICE_INTERNAL_PORT || sites.services['logg-r'].internalPort,
      LOGGR_SERVICE_EXTENAL_URL: process.env.LOGGR_SERVICE_EXTENAL_URL || sites.services['logg-r'].externalPath,
      GITHUB_CLIENT_ID: process.env.GITHUB_CLIENT_ID || tokens.githubClientId,
      GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID || tokens.googleClientId,
      ...sites.frontends,
      ...sites.services,
    }),
  ],
  module: {
    rules: [
      // { test: /\.tsx?$/, loader: 'ts-loader', options: { projectReferences: true } },
      {
        test: /.tsx?$/,
        use: [
          {
            loader: 'ts-loader',
            options: {
              transpileOnly: true,
              projectReferences: true,
            },
          },
        ],
        exclude: /node_modules/,
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
