// import { argv } from 'process'
import { attachShutdownHandler, existsAsync } from '@common/service-utils'
import { VerboseConsoleLogger } from '@furystack/logging'
import { Injector } from '@furystack/inject'
import { FileStores } from '@common/config'
import { RabbitListener } from './services/rabbit-listener'

// const namePostfix = argv[2] || 'default'

export const injector = new Injector()
injector.useLogging(VerboseConsoleLogger)

const logger = injector.logger.withScope('INIT')
;(async () => {
  await logger.information({ message: 'Initializing media-encoder...' })
  const tempDirExists = await existsAsync(FileStores.mediaEncoderWorkerTemp)

  if (!tempDirExists) {
    logger.error({
      message: 'Media Worker temp dir does not exists or not accessible. Task skipped!',
      data: { dir: FileStores.mediaEncoderWorkerTemp },
    })
    process.exit(1)
  }
})()

injector.getInstance(RabbitListener)
attachShutdownHandler(injector)
