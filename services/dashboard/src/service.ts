import { diag } from '@common/models'
import { attachShutdownHandler, runPatches } from '@common/service-utils'
import { Injector } from '@furystack/inject'
import { LogLevel, useLogging, VerboseConsoleLogger } from '@furystack/logging'
import { tokens } from '@common/config'
import { ApplicationContextService } from '@common/service-utils/src/application-context'
import { useDbLogger } from '@common/service-utils/src/use-db-logger'
import { useSlackLogger } from '@common/service-utils/src/use-slack-logger'
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
