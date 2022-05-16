import {
  attachShutdownHandler,
  runPatches,
  ApplicationContextService,
  useDbLogger,
  useSlackLogger,
} from '@common/service-utils'
import { Injector } from '@furystack/inject'
import { LogLevel, useLogging, VerboseConsoleLogger } from '@furystack/logging'
import { tokens } from '@common/config'

import { createInitialIndexes } from './patches'
import { setupStores } from './setup-stores'
import { setupRepository } from './setup-repository'
import { setupRestApi } from './setup-rest-api'

const injector = new Injector()
injector.setExplicitInstance(new ApplicationContextService('xpense'))
useDbLogger({ injector, minLevel: LogLevel.Information })
useLogging(injector, VerboseConsoleLogger)
useSlackLogger(injector, tokens.slackLogger)

attachShutdownHandler(injector)

setupStores(injector)
setupRepository(injector)
setupRestApi(injector)

runPatches({ injector, patches: [createInitialIndexes] })
