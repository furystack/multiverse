import { GetCurrentUser, IsAuthenticated, LoginAction, LogoutAction, Authenticate } from '@furystack/rest-service'
import { sites } from '@common/config'
import { User, apis, deserialize, Profile, Organization } from '@common/models'
import { RequestAction } from '@furystack/rest'
import { attachShutdownHandler, createCollectionEndpoint, createSinglePostEndpoint } from '@common/service-utils'
import {
  AttachGithubAccount,
  AttachGoogleAccountAction,
  DetachGithubAccount,
  DetachGoogleAccount,
  ChangePasswordAction,
  GithubLoginAction,
  GithubRegisterAction,
  GoogleRegisterAction,
  RegisterAction,
  GoogleLoginAction,
  GetAvatar,
  GetProfile,
  GetOrganization,
  PatchOrganization,
  GetLoginProviderDetails,
} from './actions'
import { injector } from './config'

injector.useRestService<apis.AuthApi>({
  port: parseInt(sites.services.auth.internalPort as any, 10),
  root: '/api/auth',
  deserializeQueryParams: deserialize,
  api: {
    GET: {
      '/currentUser': (GetCurrentUser as unknown) as RequestAction<{ result: User }>,
      '/isAuthenticated': IsAuthenticated,
      '/profiles': createCollectionEndpoint({ model: Profile }),
      '/profiles/:username': GetProfile,
      '/profiles/:username/avatar': GetAvatar,
      '/organizations': createCollectionEndpoint({ model: Organization }),
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
      '/organizations': createSinglePostEndpoint(Organization),
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
