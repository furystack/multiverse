/* eslint-disable @typescript-eslint/no-var-requires */
const path = require('path')
const webpack = require('webpack')
const { sites, tokens } = require('@common/config')

module.exports = {
  entry: './src/index.tsx',
  output: {
    publicPath: '/',
    path: path.resolve(`${__dirname}/bundle`),
  },
  resolve: {
    extensions: ['.ts', '.tsx', '.js', '.json'],
  },
  plugins: [
    new webpack.EnvironmentPlugin({
      APP_VERSION: require('./package.json').version,
      BUILD_DATE: new Date().toISOString(),
      WRAPPR_SERVICE_INTERNAL_PORT: sites.services['wrap-r'].internalPort,
      WRAPPR_SERVICE_EXTERNAL_URL: sites.services['wrap-r'].externalPath,
      LOGGR_SERVICE_INTERNAL_PORT: sites.services['logg-r'].internalPort,
      LOGGR_SERVICE_EXTERNAL_URL: sites.services['logg-r'].externalPath,
      XPENSE_SERVICE_INTERNAL_PORT: sites.services.xpense.internalPort,
      XPENSE_SERVICE_EXTERNAL_URL: sites.services.xpense.externalPath,
      GITHUB_CLIENT_ID: process.env.GITHUB_CLIENT_ID || tokens.githubClientId,
      GITHUB_CLIENT_SECRET: process.env.GITHUB_CLIENT_SECRET || tokens.githubClientSecret,
      GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID || tokens.googleClientId,
      ...sites.frontends,
      ...sites.services,
    }),
  ],
  module: {
    rules: [
      {
        test: /.tsx?$/,
        use: [
          {
            loader: 'ts-loader',
            options: {
              transpileOnly: true,
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
