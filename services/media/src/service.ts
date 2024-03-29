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
import { createInitialIndexes } from './patches'
import { setupStores } from './setup-stores'
import { setupRestApi } from './setup-rest-api'
import { setupRepository } from './setup-repository'
import { MediaLibraryWatcher } from './services/media-library-watcher'
import { createSeriesIndex } from './patches/01-create-series-index'
import { MediaMessaging } from './services/media-messaging'

const injector = new Injector()

injector.setExplicitInstance(new ApplicationContextService('media'))
useDbLogger({ injector, minLevel: LogLevel.Information })
useLogging(injector, VerboseConsoleLogger)
useSlackLogger(injector, tokens.slackLogger)

setupStores(injector)
setupRepository(injector)
setupRestApi(injector)
attachShutdownHandler(injector)

injector.getInstance(MediaLibraryWatcher).init() // To init fs watcher
injector.getInstance(MediaMessaging).init() // To init fs watcher

runPatches({ injector, patches: [createInitialIndexes, createSeriesIndex] })
