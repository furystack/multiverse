import { diag } from '@common/models'
import { attachShutdownHandler, runPatches } from '@common/service-utils'
import { LogLevel, VerboseConsoleLogger } from '@furystack/logging'
import { Injector } from '@furystack/inject'
import { tokens } from '@common/config'
import { createInitialIndexes } from './patches'
import { setupRestApi } from './setup-rest-api'

const injector = new Injector()

injector
  .setupApplicationContext({ name: 'diag' })
  .useDbLogger({ minLevel: LogLevel.Information })
  .useLogging(VerboseConsoleLogger)
  .useSlackLogger(tokens.slackLogger)
setupRestApi(injector)

attachShutdownHandler(injector)

runPatches({ injector, patches: [createInitialIndexes] }).then(() => {
  injector.setupRepository((repo) => repo.createDataSet(diag.Patch, '_id', {}))
})
