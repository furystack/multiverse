import { appCommandProvider } from './apps'
import { browserCommandProvider } from './browser'
import { xpenseCommandProvider } from './xpense'

export const getCommandProviders = () => [appCommandProvider, browserCommandProvider, xpenseCommandProvider]
