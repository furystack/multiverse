import '@furystack/auth-google'
import '@furystack/repository/dist/injector-extension'
import { VerboseConsoleLogger } from '@furystack/logging'
import { Injector } from '@furystack/inject'

export const injector = new Injector()

injector.useDbLogger({ appName: 'diag' }).useCommonHttpAuth().useLogging(VerboseConsoleLogger)
