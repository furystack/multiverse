import { createComponent, initializeShadeRoot } from '@furystack/shades'
import { VerboseConsoleLogger } from '@furystack/logging'
import { Injector } from '@furystack/inject'
import { PathHelper } from '@furystack/utils'
import { services } from 'sites/src'
import { Layout } from './components/layout'
import './services/google-auth-provider'
import '@furystack/odata-fetchr'

const shadeInjector = new Injector()

export const environmentOptions = {
  nodeEnv: process.env.NODE_ENV as 'development' | 'production',
  debug: Boolean(process.env.DEBUG),
  appVersion: process.env.APP_VERSION as string,
  buildDate: new Date(process.env.BUILD_DATE as string),
  serviceUrl: (process.env.MULTIVERSE_SERVICE_wrapr as string) || services.wrapr,
}

shadeInjector.useOdataClient({
  serviceEndpoint: PathHelper.joinPaths(environmentOptions.serviceUrl, '/'),
  defaultInit: {},
})

shadeInjector.useLogging(VerboseConsoleLogger)

shadeInjector.logger.withScope('Startup').verbose({
  message: 'Initializing Shade Frontend...',
  data: { environmentOptions },
})

shadeInjector.useGoogleAuth({
  clientId: process.env.MULTIVERSE_TOKEN_googleClientId as string,
})

const rootElement: HTMLDivElement = document.getElementById('root') as HTMLDivElement
initializeShadeRoot({
  rootElement,
  injector: shadeInjector,
  jsxElement: <Layout />,
})
