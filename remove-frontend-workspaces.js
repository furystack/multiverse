const { promises } = require('fs')
const rimraf = require('rimraf')

const run = async () => {
  console.log("Removing './frontend/*' from 'package.json/workspaces/packages'...")
  const package = require('./package.json')
  package.workspaces.packages = package.workspaces.packages.filter((p) => p !== 'frontends/*')
  promises.writeFile('package.json', JSON.stringify(package, undefined, 2))

  console.log("Removing './common/components'")
  await new Promise((resolve, reject) => rimraf('./common/components', (err) => (err ? reject(err) : resolve())))

  console.log("Removing './common/frontend-utils'")
  await new Promise((resolve, reject) => rimraf('./common/frontend-utils', (err) => (err ? reject(err) : resolve())))

  console.log("Removing './frontends/*/node_modules'")
  await new Promise((resolve, reject) => rimraf('./frontends/*/node_modules', (err) => (err ? reject(err) : resolve())))

  console.log("Removing './services/*/node_modules'")
  await new Promise((resolve, reject) => rimraf('./services/*/node_modules', (err) => (err ? reject(err) : resolve())))

  console.log("Removing './workers/*/node_modules'")
  await new Promise((resolve, reject) => rimraf('./workers/*/node_modules', (err) => (err ? reject(err) : resolve())))

  console.log("Removing './node_modules'")
  await new Promise((resolve, reject) => rimraf('./node_modules', (err) => (err ? reject(err) : resolve())))
}

run()
