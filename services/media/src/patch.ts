import { runPatches, attachShutdownHandler } from '@common/service-utils'
import { injector } from './config'
import { createInitialIndexes } from './patches'

attachShutdownHandler(injector)
runPatches({ injector, appName: 'media', patches: [createInitialIndexes] })
  .then(() => process.exit(0))
  .catch(() => process.exit(1))
