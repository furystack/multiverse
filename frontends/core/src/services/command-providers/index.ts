import { appCommandProvider } from './apps'
import { browserCommandProvider } from './browser'

export const getCommandProviders = () => [appCommandProvider, browserCommandProvider]
