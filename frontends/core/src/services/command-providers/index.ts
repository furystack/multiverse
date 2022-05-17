import { appCommandProvider } from './apps'
import { browserCommandProvider } from './browser'
import { continueMovieProvider } from './movies'

export const getCommandProviders = () => [appCommandProvider, browserCommandProvider, continueMovieProvider]
