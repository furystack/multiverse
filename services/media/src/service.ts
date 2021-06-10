import { attachShutdownHandler, runPatches } from '@common/service-utils'
import { Injector } from '@furystack/inject'
import { LogLevel, VerboseConsoleLogger } from '@furystack/logging'
import { tokens } from '@common/config'
import { createInitialIndexes } from './patches'
import { setupStores } from './setup-stores'
import { setupRestApi } from './setup-rest-api'
import { setupRepository } from './setup-repository'
import { MediaLibraryWatcher } from './services/media-library-watcher'

const injector = new Injector()
injector
  .setupApplicationContext({ name: 'media' })
  .useDbLogger({ minLevel: LogLevel.Information })
  .useLogging(VerboseConsoleLogger)
  .useSlackLogger(tokens.slackLogger)

injector.logger.withScope('Test').verbose({ message: 'alma', data: { sendToSlack: true } })

setupStores(injector)
setupRepository(injector)
setupRestApi(injector)
attachShutdownHandler(injector)

injector.getInstance(MediaLibraryWatcher) // To init fs watcher

runPatches({ injector, patches: [createInitialIndexes] })
