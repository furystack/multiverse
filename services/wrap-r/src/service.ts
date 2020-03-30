import { GetCurrentUser, IsAuthenticated, LoginAction, LogoutAction } from '@furystack/rest-service'
import { sites } from 'common-config'
import { User, WrapRApi } from 'common-models'
import { RequestAction } from '@furystack/rest'
import { attachShutdownHandler } from 'common-service-utils'
import {
  GithubLoginAction,
  GithubRegisterAction,
  GoogleRegisterAction,
  RegisterAction,
  GoogleLoginAction,
} from './actions'
import { injector } from './config'

injector.useRestService<WrapRApi>({
  port: parseInt(sites.services['wrap-r'].internalPort as any, 10),
  root: '/api/wrap-r',
  api: {
    GET: {
      '/currentUser': (GetCurrentUser as unknown) as RequestAction<{ result: User }>,
      '/isAuthenticated': IsAuthenticated,
    },
    POST: {
      '/githubLogin': GithubLoginAction,
      '/githubRegister': GithubRegisterAction,
      '/googleLogin': GoogleLoginAction,
      '/googleRegister': GoogleRegisterAction,
      '/login': LoginAction as any,
      '/logout': LogoutAction,
      '/register': RegisterAction,
    },
  },
  cors: {
    credentials: true,
    origins: Object.values(sites.frontends),
  },
})

attachShutdownHandler(injector)
