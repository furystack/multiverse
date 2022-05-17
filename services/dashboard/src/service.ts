import { diag } from '@common/models'
import {
  ApplicationContextService,
  attachShutdownHandler,
  runPatches,
  useDbLogger,
  useSlackLogger,
} from '@common/service-utils'
import { Injector } from '@furystack/inject'
import { LogLevel, useLogging, VerboseConsoleLogger } from '@furystack/logging'
import { tokens } from '@common/config'
import { getRepository } from '@furystack/repository'
import { createInitialIndexes } from './patches'
import { setupStores } from './setup-stores'
import { setupRestApi } from './setup-rest-api'
import { setupRepository } from './setup-repository'
;(async () => {
  const injector = new Injector()
  injector.setExplicitInstance(new ApplicationContextService('dashboard'))
  attachShutdownHandler(injector)
  setupStores(injector)
  setupRepository(injector)
  setupRestApi(injector)

  useDbLogger({ injector, minLevel: LogLevel.Information })
  useLogging(injector, VerboseConsoleLogger)
  useSlackLogger(injector, tokens.slackLogger)

  runPatches({ injector, patches: [createInitialIndexes] }).then(() => {
    getRepository(injector).createDataSet(diag.Patch, '_id', {})
  })
})()
