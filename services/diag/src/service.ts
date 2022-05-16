import { diag } from '@common/models'
import { attachShutdownHandler, runPatches } from '@common/service-utils'
import { LogLevel, useLogging, VerboseConsoleLogger } from '@furystack/logging'
import { Injector } from '@furystack/inject'
import { tokens } from '@common/config'
import { useDbLogger } from '@common/service-utils/src/use-db-logger'
import { useSlackLogger } from '@common/service-utils/src/use-slack-logger'
import { ApplicationContextService } from '@common/service-utils/src/application-context'
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
