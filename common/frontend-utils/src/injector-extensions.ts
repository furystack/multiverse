import { Injector } from '@furystack/inject/dist/injector'
import { IdentityContext } from '@furystack/core'
import { SessionService } from './session'

declare module '@furystack/inject/dist/injector' {
  // eslint-disable-next-line no-shadow
  export interface Injector {
    useSessionService: () => void
  }
}

Injector.prototype.useSessionService = function () {
  this.setExplicitInstance(this.getInstance(SessionService), IdentityContext)
}
