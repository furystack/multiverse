import { appCommandProvider } from './apps'
import { browserCommandProvider } from './browser'
import { continueMovieProvider } from './movies'
import { xpenseCommandProvider } from './xpense'

export const getCommandProviders = () => [
  appCommandProvider,
  browserCommandProvider,
  xpenseCommandProvider,
  continueMovieProvider,
]
