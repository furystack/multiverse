import { PathHelper } from '@furystack/utils'
import { createComponent, initializeShadeRoot } from '@furystack/shades'
import { VerboseConsoleLogger } from '@furystack/logging'
import { services } from 'sites'
import { Injector } from '@furystack/inject'
import { Layout } from './components/layout'
import './services/google-auth-provider'
import '@furystack/odata-fetchr'

const shadeInjector = new Injector()

export const environmentOptions = {
  nodeEnv: process.env.NODE_ENV as 'development' | 'production',
  debug: Boolean(process.env.DEBUG),
  appVersion: process.env.APP_VERSION as string,
  buildDate: new Date(process.env.BUILD_DATE as string),
  serviceUrl: process.env.APP_SERVICE_URL as string,
}

shadeInjector.useOdata({
  serviceEndpoint: PathHelper.joinPaths(services.wrapr, '/'),
  defaultInit: {},
})

shadeInjector.useLogging(VerboseConsoleLogger)

shadeInjector.logger.withScope('Startup').verbose({
  message: 'Initializing Shade Frontend...',
  data: { environmentOptions },
})

shadeInjector.useGoogleAuth({
  clientId: '626364599424-47aut7jidipmngkt4r7inda1erl8ckqg.apps.googleusercontent.com',
})

const rootElement: HTMLDivElement = document.getElementById('root') as HTMLDivElement
initializeShadeRoot({
  rootElement,
  injector: shadeInjector,
  jsxElement: <Layout />,
})
