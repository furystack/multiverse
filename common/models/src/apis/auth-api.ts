import { RequestAction, RestApi } from '@furystack/rest'
import { PartialResult } from '@furystack/core'
import { User } from '../auth/user'
import { Profile } from '../auth/profile'
import { Organization } from '../auth/organization'
import { GoogleAccount } from '../auth/google-account'
import { GithubAccount } from '../auth/github-account'
import { CollectionEndpoint, SinglePostEndpoint } from '../endpoints'
import { UserSettings } from '../schemas'

export interface AuthApi extends RestApi {
  GET: {
    '/isAuthenticated': RequestAction<{ result: { isAuthenticated: boolean } }>
    '/currentUser': RequestAction<{ result: User }>
    '/loginProviderDetails': RequestAction<{
      result: { google?: GoogleAccount; github?: GithubAccount; hasPassword: boolean }
    }>
    '/profiles/:username': RequestAction<{ result: PartialResult<Profile, any>; urlParams: { username: string } }>
    '/profiles/:username/avatar': RequestAction<{ result: any; urlParams: { username: string } }>
    '/profiles': CollectionEndpoint<Profile>
    '/organizations': CollectionEndpoint<Organization>
    '/organization/:organizationName': RequestAction<{
      result: PartialResult<Organization, any>
      urlParams: { organizationName: string }
    }>
  }
  POST: {
    '/login': RequestAction<{ body: { username: string; password: string }; result: User }>
    '/register': RequestAction<{ body: { email: string; password: string }; result: User }>
    '/googleLogin': RequestAction<{ body: { token: string }; result: User }>
    '/googleRegister': RequestAction<{ body: { token: string }; result: User }>
    '/attachGoogleAccount': RequestAction<{ body: { token: string }; result: User }>
    '/detachGoogleAccount': RequestAction<{ result: User }>
    '/githubLogin': RequestAction<{ body: { code: string; clientId: string }; result: User }>
    '/githubRegister': RequestAction<{ body: { code: string; clientId: string }; result: User }>
    '/attachGithubAccount': RequestAction<{ body: { code: string; clientId: string }; result: User }>
    '/detachGithubAccount': RequestAction<{ result: User }>
    '/logout': RequestAction<{}>
    '/settings': RequestAction<{ body: UserSettings }>
    '/changePassword': RequestAction<{
      body: { currentPassword: string; newPassword: string }
      result: { success: boolean }
    }>

    '/organizations': SinglePostEndpoint<Organization>
  }
  PATCH: {
    '/organizations/:organizationName': RequestAction<{
      body: Partial<Organization>
      result: Organization
      urlParams: { organizationName: string }
    }>
  }
}
