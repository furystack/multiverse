import { GetCurrentUser, IsAuthenticated, LoginAction, LogoutAction } from '@furystack/rest-service'
import { sites } from 'common-config'
import { User, WrapRApi } from 'common-models'
import { RequestAction } from '@furystack/rest'
import {
  GithubLoginAction,
  GithubRegisterAction,
  GoogleRegisterAction,
  RegisterAction,
  GoogleLoginAction,
} from './actions'
import { injector } from './config'

const serviceUrl = new URL(sites.services['wrap-r'])

injector.useRestService<WrapRApi>({
  port: parseInt(serviceUrl.port, 10),
  hostName: serviceUrl.hostname,
  root: '/wrap-r',
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
injector.disposeOnProcessExit()
