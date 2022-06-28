import { attachShutdownHandler, existsAsync } from '@common/service-utils'
import { getLogger, useLogging, VerboseConsoleLogger } from '@furystack/logging'
import { Injector } from '@furystack/inject'
import { FileStores } from '@common/config'
import { RabbitListener } from './services/rabbit-listener'
import { TaskLogger } from './services/task-logger'

export const injector = new Injector()
useLogging(injector, VerboseConsoleLogger, TaskLogger)

const logger = getLogger(injector).withScope('INIT')
;(async () => {
  await logger.information({ message: 'Initializing media-encoder...' })
  const tempDirExists = await existsAsync(FileStores.mediaEncoderWorkerTemp)

  if (!tempDirExists) {
    await logger.error({
      message: 'Media Worker temp dir does not exists or not accessible. Task skipped!',
      data: { dir: FileStores.mediaEncoderWorkerTemp },
    })
    process.exit(1)
  }
})()
  .catch((err) => {
    console.error('Error during initialization', { err })
    process.exit(1)
  })
  .then(() => {
    console.log('Init completed')
  })

injector.getInstance(RabbitListener).init()
attachShutdownHandler(injector)
