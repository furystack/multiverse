/* eslint-disable @typescript-eslint/no-var-requires */
const path = require('path')
const webpack = require('webpack')
const { sites, tokens } = require('@common/config')

const { RelativeCiAgentWebpackPlugin } = require('@relative-ci/agent')
const MonacoWebpackPlugin = require('monaco-editor-webpack-plugin')

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
      AUTH_SERVICE_INTERNAL_PORT: sites.services.auth.internalPort,
      AUTH_SERVICE_EXTERNAL_URL: sites.services.auth.externalPath,
      DIAG_SERVICE_INTERNAL_PORT: sites.services.diag.internalPort,
      DIAG_SERVICE_EXTERNAL_URL: sites.services.diag.externalPath,
      XPENSE_SERVICE_INTERNAL_PORT: sites.services.xpense.internalPort,
      XPENSE_SERVICE_EXTERNAL_URL: sites.services.xpense.externalPath,
      MEDIA_SERVICE_INTERNAL_PORT: sites.services.media.internalPort,
      MEDIA_SERVICE_EXTERNAL_URL: sites.services.media.externalPath,
      GITHUB_CLIENT_ID: tokens.githubClientId,
      GITHUB_CLIENT_SECRET: tokens.githubClientSecret,
      GOOGLE_CLIENT_ID: tokens.googleClientId,
      ...sites.frontends,
      ...sites.services,
    }),
    new RelativeCiAgentWebpackPlugin(),
    new MonacoWebpackPlugin(),
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
