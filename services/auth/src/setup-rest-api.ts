import { Injector } from '@furystack/inject'
import { apis, deserialize, auth } from '@common/models'
import { sites } from '@common/config'
import {
  GetCurrentUser,
  IsAuthenticated,
  createGetCollectionEndpoint,
  Authenticate,
  LoginAction,
  LogoutAction,
  createPostEndpoint,
  createPatchEndpoint,
  Authorize,
  createGetEntityEndpoint,
  RequestAction,
} from '@furystack/rest-service'
import {
  GetProfile,
  GetAvatar,
  GetOrganization,
  GetLoginProviderDetails,
  getOauthData,
  GithubLoginAction,
  GithubRegisterAction,
  AttachGithubAccount,
  DetachGithubAccount,
  GoogleLoginAction,
  GoogleRegisterAction,
  AttachGoogleAccountAction,
  DetachGoogleAccount,
  RegisterAction,
  ChangePasswordAction,
  OrganizationAddAdmin,
  OrganizationAddMember,
  OrganizationRemoveAdmin,
  OrganizationRemoveMember,
  PatchOrganization,
  AcceptTermsAction,
} from './actions'
import { UploadAvatar } from './actions/upload-avatar'
import { PostSettings } from './actions/post-settings'

export const setupRestApi = async (injector: Injector) => {
  injector.useCommonHttpAuth()
  injector.useRestService<apis.AuthApi>({
    port: parseInt(sites.services.auth.internalPort as any, 10),
    root: '/api/auth',
    deserializeQueryParams: deserialize,
    api: {
      GET: {
        '/currentUser': (GetCurrentUser as unknown) as RequestAction<{ result: auth.User }>,
        '/isAuthenticated': IsAuthenticated,
        '/profiles': createGetCollectionEndpoint({ model: auth.Profile }),
        '/profiles/:username': GetProfile,
        '/profiles/:username/avatar': GetAvatar,
        '/organizations': createGetCollectionEndpoint({ model: auth.Organization }),
        '/organization/:organizationName': GetOrganization,
        '/loginProviderDetails': Authenticate()(GetLoginProviderDetails),
        '/oauth-data': getOauthData,
        '/users': Authorize('user-admin')(createGetCollectionEndpoint({ model: auth.User })),
        '/users/:id': Authorize('user-admin')(createGetEntityEndpoint({ model: auth.User })),
      },
      POST: {
        '/avatar': UploadAvatar,
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
        '/accept-terms': Authenticate()(AcceptTermsAction),
        '/organizations': createPostEndpoint({ model: auth.Organization }),
        '/changePassword': Authenticate()(ChangePasswordAction),
        '/settings': Authenticate()(PostSettings),
        '/organization/:organizationName/addAdmin': OrganizationAddAdmin,
        '/organization/:organizationName/addMember': OrganizationAddMember,
        '/organization/:organizationName/removeAdmin': OrganizationRemoveAdmin,
        '/organization/:organizationName/removeMember': OrganizationRemoveMember,
      },
      PATCH: {
        '/organizations/:organizationName': PatchOrganization,
        '/profiles/:id': createPatchEndpoint({ model: auth.Profile }),
        '/users/:id': Authorize('user-admin')(createPatchEndpoint({ model: auth.User })),
      },
    },
    cors: {
      credentials: true,
      origins: Object.values(sites.frontends),
      methods: ['GET', 'POST', 'DELETE', 'PATCH'],
    },
  })
}
