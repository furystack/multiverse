// eslint-disable-next-line @typescript-eslint/no-var-requires
const { defineConfig } = require('cypress')

module.exports = defineConfig({
  fixturesFolder: 'cypress/fixtures',
  defaultCommandTimeout: 10000,
  reporter: 'junit',
  reporterOptions: {
    mochaFile: 'testresults/output-[hash].xml',
  },
  screenshotsFolder: './cypress/snapshots/actual',
  trashAssetsBeforeRuns: true,
  env: {
    failSilently: false,
  },
  e2e: {
    // We've imported your old cypress plugins here.
    // You may want to clean this up later by importing these.
    specPattern: 'cypress/e2e/**/*.spec.*',
    excludeSpecPattern: ['**/__snapshots__/*', '**/__image_snapshots__/*'],
    baseUrl: 'http://localhost:8080',
    projectId: '3zrp8x',
  },
})
