import 'reflect-metadata'

import { createComponent, initializeShadeRoot } from '@furystack/shades'
import { useLogging, getLogger, VerboseConsoleLogger } from '@furystack/logging'
import { Injector } from '@furystack/inject'
import type { SiteRoots } from '@common/frontend-utils'
import { EnvironmentService, useSessionService } from '@common/frontend-utils'
import { MultiverseApp } from './app'
import { useGoogleAuth } from './services/google-auth-provider'

declare global {
  interface Window {
    __multiverse_api_root?: string
    __multiverse_site_roots?: SiteRoots
    process: {
      env: any
    }
  }
}

window.process = { env: {} } as any

const apiRoot = window.__multiverse_api_root || window.location.origin
const defaultSiteRoots: SiteRoots = {
  auth: apiRoot,
  dashboard: apiRoot,
  diag: apiRoot,
  media: apiRoot,
}

const shadeInjector = new Injector()

shadeInjector.setExplicitInstance(
  new EnvironmentService({
    commitHash: process.env.COMMIT_HASH || '',
    nodeEnv: process.env.NODE_ENV as 'development' | 'production',
    debug: Boolean(process.env.DEBUG),
    appVersion: process.env.APP_VERSION as string,
    buildDate: new Date(process.env.BUILD_DATE as string),
    apiRoot,
    siteRoots: {
      ...defaultSiteRoots,
      ...window.__multiverse_site_roots,
    },
  }),
)

export const environmentOptions = {}

useLogging(shadeInjector, VerboseConsoleLogger)

getLogger(shadeInjector).withScope('Startup').verbose({
  message: 'Initializing Shade Frontend...',
  data: { environmentOptions },
})

useGoogleAuth(shadeInjector)

useSessionService(shadeInjector)

const rootElement: HTMLDivElement = document.getElementById('root') as HTMLDivElement
initializeShadeRoot({
  rootElement,
  injector: shadeInjector,
  jsxElement: <MultiverseApp />,
})
