import { diag } from '@common/models'
import { attachShutdownHandler, runPatches } from '@common/service-utils'
import { Injector } from '@furystack/inject'
import { LogLevel, VerboseConsoleLogger } from '@furystack/logging'
import { createInitialIndexes } from './patches'
import { setupStores } from './setup-stores'
import { setupRestApi } from './setup-rest-api'
import { setupRepository } from './setup-repository'
;(async () => {
  const injector = new Injector().setupApplicationContext({ name: 'dashboard' })
  attachShutdownHandler(injector)
  setupStores(injector)
  setupRepository(injector)
  setupRestApi(injector)
  injector.useDbLogger({ minLevel: LogLevel.Information }).useLogging(VerboseConsoleLogger)

  runPatches({ injector, patches: [createInitialIndexes] }).then(() => {
    injector.setupRepository((repo) => repo.createDataSet(diag.Patch, '_id', {}))
  })
})()
