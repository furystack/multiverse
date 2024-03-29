/* eslint-disable @typescript-eslint/no-var-requires */
const commitHash = require('child_process').execSync('git rev-parse HEAD').toString()
const path = require('path')
const webpack = require('webpack')
const { sites, tokens } = require('@common/config')

const { RelativeCiAgentWebpackPlugin } = require('@relative-ci/agent')
const MonacoWebpackPlugin = require('monaco-editor-webpack-plugin')

const CopyWebpackPlugin = require('copy-webpack-plugin')

const proxyRules = {
  ...Object.values(sites.services).reduce((prev, current) => {
    prev[current.apiPath] = { target: `http://localhost:${current.internalPort}`, ws: true }
    return prev
  }, {}),
}

module.exports = {
  entry: './src/index.tsx',
  output: {
    publicPath: '/',
    path: path.resolve(`${__dirname}/bundle`),
  },
  resolve: {
    extensions: ['.ts', '.tsx', '.js', '.json'],
  },
  devServer: {
    proxy: proxyRules,
  },
  plugins: [
    new webpack.EnvironmentPlugin({
      APP_VERSION: require('./package.json').version,
      BUILD_DATE: new Date().toISOString(),
      GITHUB_CLIENT_ID: tokens.githubClientId,
      GOOGLE_CLIENT_ID: tokens.googleClientId,
      COMMIT_HASH: commitHash,
      ...sites.frontends,
      ...sites.services,
    }),
    new RelativeCiAgentWebpackPlugin(),
    new MonacoWebpackPlugin({
      languages: ['json'],
    }),
    new CopyWebpackPlugin({
      patterns: [{ from: 'static', to: 'static' }],
    }),
  ],
  module: {
    rules: [
      {
        test: /\.md$/i,
        use: 'raw-loader',
      },
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
