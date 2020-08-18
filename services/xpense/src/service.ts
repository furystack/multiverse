import { attachShutdownHandler, runPatches } from '@common/service-utils'
import { Injector } from '@furystack/inject'
import { LogLevel, VerboseConsoleLogger } from '@furystack/logging'
import { createInitialIndexes } from './patches'
import { setupStores } from './setup-stores'
import { setupRepository } from './setup-repository'
import { setupRestApi } from './setup-rest-api'

const injector = new Injector()
  .setupApplicationContext({ name: 'xpense' })
  .useDbLogger({ minLevel: LogLevel.Information })
  .useLogging(VerboseConsoleLogger)

attachShutdownHandler(injector)

setupStores(injector)
setupRepository(injector)
setupRestApi(injector)

runPatches({ injector, patches: [createInitialIndexes] })
