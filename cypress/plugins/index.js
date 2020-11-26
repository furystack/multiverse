// ***********************************************************
// This example plugins/index.js can be used to load plugins
//
// You can change the location of this file or turn off loading
// the plugins file with the 'pluginsFile' configuration option.
//
// You can read more here:
// https://on.cypress.io/plugins-guide
// ***********************************************************

// This function is called when a project is opened or re-opened (e.g. due to
// the project's config changing)

const { initPlugin } = require('cypress-plugin-snapshots/plugin')
const fs = require('fs')
const path = require('path')

const { sites } = require('@common/config')

const getCurrentUser = (filePath) => {
  try {
    const user = JSON.parse(fs.readFileSync(path.join(__dirname, filePath), 'utf8'))
    return user
  } catch (error) {
    return { email: '', password: '' }
  }
}

module.exports = (on, config) => {
  config.baseUrl = sites.frontends.core
  // on('file:preprocessor', webpack(options))
  on('task', {
    getCurrentUser(filePath) {
      return getCurrentUser(filePath)
    },
  })
  initPlugin(on, config)
  return config
}
