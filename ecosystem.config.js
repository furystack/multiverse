/* eslint-disable @typescript-eslint/no-var-requires */

const { dirname, join } = require('path')
const { existsSync } = require('fs')
const glob = require('glob')

const getWorkerServiceEntries = () => {
  const packageDirs = ['services/*', 'workers/*']
  const serviceWorkerPackageFiles = packageDirs.map((dir) => glob.sync(`${dir}/package.json`)).flatMap((f) => f)

  const serviceWorkerPackages = serviceWorkerPackageFiles.map((packageFile) => ({
    packageFile,
    packageContent: require(`./${packageFile}`),
  }))
  return serviceWorkerPackages.map(({ packageFile, packageContent }) => ({
    cwd: dirname(packageFile),
    name: packageContent.name,
    script: packageContent.main,
    watch: [
      join(dirname(packageFile), 'dist'),
      'common/config/dist',
      'common/models/dist',
      'common/service-utils/dist',
    ],
  }))
}

const services = (module.exports = {
  apps: [
    ...getWorkerServiceEntries(),
    {
      cwd: process.cwd(),
      name: 'tsc',
      script: './node_modules/typescript/lib/tsc.js',
      args: '-b --watch',
      watch: false,
    },
  ],
})

module.exports = services
