import '@furystack/auth-google'
import '@furystack/repository/dist/injector-extension'
import { ConsoleLogger } from '@furystack/logging'
import { Injector } from '@furystack/inject'

export const injector = new Injector()

injector.useDbLogger({ appName: 'diag' }).useCommonHttpAuth().useLogging(ConsoleLogger)
