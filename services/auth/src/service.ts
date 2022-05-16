import { attachShutdownHandler, runPatches } from '@common/service-utils'
import { Injector } from '@furystack/inject'
import { LogLevel, useLogging, VerboseConsoleLogger } from '@furystack/logging'
import { tokens } from '@common/config'
import { useDbLogger } from '@common/service-utils/src/use-db-logger'
import { useSlackLogger } from '@common/service-utils/src/use-slack-logger'
import { ApplicationContextService } from '@common/service-utils/src/application-context'
import { createInitialIndexes } from './patches'
import { setupRestApi } from './setup-rest-api'
import { setupStores } from './setup-stores'
import { setupRepository } from './setup-repository'

/** */
;(async () => {
  const injector = new Injector()
  injector.setExplicitInstance(new ApplicationContextService('auth'))
  setupStores(injector)
  setupRepository(injector)
  useDbLogger({ injector, minLevel: LogLevel.Information })
  useLogging(injector, VerboseConsoleLogger)
  useSlackLogger(injector, tokens.slackLogger)

  await setupRestApi(injector)
  attachShutdownHandler(injector)
  runPatches({ injector, patches: [createInitialIndexes] })
})()
