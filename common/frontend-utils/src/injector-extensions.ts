import { Injector } from '@furystack/inject'
import { IdentityContext } from '@furystack/core'
import { SessionService } from './session'

export const useSessionService = (injector: Injector) =>
  injector.setExplicitInstance(injector.getInstance(SessionService), IdentityContext)
