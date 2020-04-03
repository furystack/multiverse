import { GetCurrentUser, IsAuthenticated, LoginAction, LogoutAction, Authenticate } from '@furystack/rest-service'
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
  GetAvatar,
  GetProfiles,
  GetProfile,
  GetOrganizations,
  GetOrganization,
  PatchOrganization,
  PostOrganization,
  GetLoginProviderDetails,
  AttachGithubAccount,
  DetachGithubAccount,
  AttachGoogleAccountAction,
  DetachGoogleAccount,
  ChangePasswordAction,
} from './actions'
import { injector } from './config'

injector.useRestService<WrapRApi>({
  port: parseInt(sites.services['wrap-r'].internalPort as any, 10),
  root: '/api/wrap-r',
  api: {
    GET: {
      '/currentUser': (GetCurrentUser as unknown) as RequestAction<{ result: User }>,
      '/isAuthenticated': IsAuthenticated,
      '/profiles': GetProfiles,
      '/profiles/:username': GetProfile,
      '/profiles/:username/avatar': GetAvatar,
      '/organizations': GetOrganizations,
      '/organization/:organizationName': GetOrganization,
      '/loginProviderDetails': Authenticate()(GetLoginProviderDetails),
    },
    POST: {
      '/githubLogin': GithubLoginAction,
      '/githubRegister': GithubRegisterAction,
      '/attachGithubAccount': Authenticate()(AttachGithubAccount),
      '/detachGithubAccount': Authenticate()(DetachGithubAccount),
      '/googleLogin': GoogleLoginAction,
      '/googleRegister': GoogleRegisterAction,
      '/attachGoogleAccount': Authenticate()(AttachGoogleAccountAction),
      '/detachGoogleAccount': Authenticate()(DetachGoogleAccount),
      '/login': LoginAction as any,
      '/logout': LogoutAction,
      '/register': RegisterAction,
      '/organizations': PostOrganization,
      '/changePassword': Authenticate()(ChangePasswordAction),
    },
    PATCH: {
      '/organizations/:organizationName': PatchOrganization,
    },
  },
  cors: {
    credentials: true,
    origins: Object.values(sites.frontends),
  },
})

attachShutdownHandler(injector)
