import { createComponent, initializeShadeRoot } from '@furystack/shades'
import { VerboseConsoleLogger } from '@furystack/logging'
import { Injector } from '@furystack/inject'
import { sites } from 'common-config'
import { Layout } from './components/layout'
import './services/google-auth-provider'
import '@furystack/rest'

const shadeInjector = new Injector()

export const environmentOptions = {
  nodeEnv: process.env.NODE_ENV as 'development' | 'production',
  debug: Boolean(process.env.DEBUG),
  appVersion: process.env.APP_VERSION as string,
  buildDate: new Date(process.env.BUILD_DATE as string),
  serviceUrl: (process.env.MULTIVERSE_SERVICE_wrapr as string) || sites.services['wrap-r'],
}

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
