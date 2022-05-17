// import { argv } from 'process'
import { attachShutdownHandler, existsAsync } from '@common/service-utils'
import { getLogger, useLogging, VerboseConsoleLogger } from '@furystack/logging'
import { Injector } from '@furystack/inject'
import { FileStores } from '@common/config'
import { RabbitListener } from './services/rabbit-listener'
import { TaskLogger } from './services/task-logger'

// const namePostfix = argv[2] || 'default'

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

injector.getInstance(RabbitListener)
attachShutdownHandler(injector)
