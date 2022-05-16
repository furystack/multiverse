import { diag } from '@common/models'
import {
  ApplicationContextService,
  attachShutdownHandler,
  runPatches,
  useDbLogger,
  useSlackLogger,
} from '@common/service-utils'
import { LogLevel, useLogging, VerboseConsoleLogger } from '@furystack/logging'
import { Injector } from '@furystack/inject'
import { tokens } from '@common/config'
import { getRepository } from '@furystack/repository'
import { createInitialIndexes } from './patches'
import { setupRestApi } from './setup-rest-api'

const injector = new Injector()

injector.setExplicitInstance(new ApplicationContextService('diag'))
useDbLogger({ injector, minLevel: LogLevel.Information })
useLogging(injector, VerboseConsoleLogger)
useSlackLogger(injector, tokens.slackLogger)
setupRestApi(injector)

attachShutdownHandler(injector)

runPatches({ injector, patches: [createInitialIndexes] }).then(() => {
  getRepository(injector).createDataSet(diag.Patch, '_id', {})
})
