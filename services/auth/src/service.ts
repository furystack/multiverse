import { GetCurrentUser, IsAuthenticated, LoginAction, LogoutAction, Authenticate } from '@furystack/rest-service'
import { sites } from '@common/config'
import { auth, apis, deserialize } from '@common/models'
import { RequestAction } from '@furystack/rest'
import {
  attachShutdownHandler,
  createCollectionEndpoint,
  createSinglePostEndpoint,
  createSinglePatchEndpoint,
  runPatches,
} from '@common/service-utils'
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
  OrganizationAddAdmin,
  OrganizationAddMember,
  OrganizationRemoveAdmin,
  OrganizationRemoveMember,
  getOauthData,
} from './actions'
import { injector } from './config'
import { PostSettings } from './actions/post-settings'
import { UploadAvatar } from './actions/upload-avatar'
import { createInitialIndexes } from './patches'

injector.useRestService<apis.AuthApi>({
  port: parseInt(sites.services.auth.internalPort as any, 10),
  root: '/api/auth',
  deserializeQueryParams: deserialize,
  api: {
    GET: {
      '/currentUser': (GetCurrentUser as unknown) as RequestAction<{ result: auth.User }>,
      '/isAuthenticated': IsAuthenticated,
      '/profiles': createCollectionEndpoint({ model: auth.Profile }),
      '/profiles/:username': GetProfile,
      '/profiles/:username/avatar': GetAvatar,
      '/organizations': createCollectionEndpoint({ model: auth.Organization }),
      '/organization/:organizationName': GetOrganization,
      '/loginProviderDetails': Authenticate()(GetLoginProviderDetails),
      '/oauth-data': getOauthData,
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
      '/organizations': createSinglePostEndpoint(auth.Organization),
      '/changePassword': Authenticate()(ChangePasswordAction),
      '/settings': Authenticate()(PostSettings),
      '/organization/:organizationName/addAdmin': OrganizationAddAdmin,
      '/organization/:organizationName/addMember': OrganizationAddMember,
      '/organization/:organizationName/removeAdmin': OrganizationRemoveAdmin,
      '/organization/:organizationName/removeMember': OrganizationRemoveMember,
    },
    PATCH: {
      '/organizations/:organizationName': PatchOrganization,
      '/profile/:id': createSinglePatchEndpoint(auth.Profile),
    },
  },
  cors: {
    credentials: true,
    origins: Object.values(sites.frontends),
    methods: ['GET', 'POST', 'DELETE', 'PATCH'],
  },
})

attachShutdownHandler(injector)

runPatches({ injector, appName: 'auth', patches: [createInitialIndexes] })
