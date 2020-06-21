// import { argv } from 'process'
import { attachShutdownHandler } from '@common/service-utils'
import { VerboseConsoleLogger } from '@furystack/logging'
import { Injector } from '@furystack/inject'
import { RabbitListener } from './services/rabbit-listener'

// const namePostfix = argv[2] || 'default'

export const injector = new Injector()
injector.useLogging(VerboseConsoleLogger)
injector.logger.withScope('INIT').information({ message: 'Initializing...' })
injector.getInstance(RabbitListener)
attachShutdownHandler(injector)
