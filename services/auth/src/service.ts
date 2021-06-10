import { attachShutdownHandler, runPatches } from '@common/service-utils'
import { Injector } from '@furystack/inject'
import { LogLevel, VerboseConsoleLogger } from '@furystack/logging'
import { tokens } from '@common/config'
import { createInitialIndexes } from './patches'
import { setupRestApi } from './setup-rest-api'
import { setupStores } from './setup-stores'
import { setupRepository } from './setup-repository'

/** */
;(async () => {
  const injector = new Injector()
  injector.setupApplicationContext({ name: 'auth' })
  setupStores(injector)
  setupRepository(injector)
  injector
    .useDbLogger({ minLevel: LogLevel.Information })
    .useLogging(VerboseConsoleLogger)
    .useSlackLogger(tokens.slackLogger)

  await setupRestApi(injector)
  attachShutdownHandler(injector)
  runPatches({ injector, patches: [createInitialIndexes] })
})()
