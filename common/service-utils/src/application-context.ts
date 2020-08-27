import { Injector } from '@furystack/inject/dist/injector'

export class ApplicationContextService {
  constructor(public readonly name: string) {}
}

declare module '@furystack/inject/dist/injector' {
  export interface Injector {
    setupApplicationContext(appContext: ApplicationContextService): this
    getApplicationContext(): ApplicationContextService
  }
}

Injector.prototype.setupApplicationContext = function (context: ApplicationContextService) {
  this.setExplicitInstance(context, ApplicationContextService)
  return this
}

Injector.prototype.getApplicationContext = function () {
  if (!this.cachedSingletons.has(ApplicationContextService)) {
    throw new Error('No Application context set.')
  }
  return this.getInstance(ApplicationContextService)
}
