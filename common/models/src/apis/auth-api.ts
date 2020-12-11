import {
  RequestAction,
  RestApi,
  GetCollectionEndpoint,
  PostEndpoint,
  PatchEndpoint,
  GetEntityEndpoint,
} from '@furystack/rest'
import { PartialResult } from '@furystack/core'
import { User } from '../auth/user'
import { Profile } from '../auth/profile'
import { Organization } from '../auth/organization'
import { GoogleAccount } from '../auth/google-account'
import { GithubAccount } from '../auth/github-account'
import { UserSettings } from '../auth'

export interface AuthApi extends RestApi {
  GET: {
    '/isAuthenticated': RequestAction<{ result: { isAuthenticated: boolean } }>
    '/currentUser': RequestAction<{ result: User }>
    '/loginProviderDetails': RequestAction<{
      result: { google?: GoogleAccount; github?: GithubAccount; hasPassword: boolean }
    }>
    '/profiles/:username': RequestAction<{ result: PartialResult<Profile, any>; urlParams: { username: string } }>
    '/profiles/:username/avatar': RequestAction<{ result: any; urlParams: { username: string } }>
    '/profiles': GetCollectionEndpoint<Profile>
    '/organizations': GetCollectionEndpoint<Organization>
    '/organization/:organizationName': RequestAction<{
      result: PartialResult<Organization, any>
      urlParams: { organizationName: string }
    }>
    '/oauth-data': RequestAction<{
      result: {
        googleClientId: string
        githubClientId: string
      }
    }>
    '/users': GetCollectionEndpoint<User>
    '/users/:id': GetEntityEndpoint<User>
  }
  POST: {
    '/login': RequestAction<{ body: { username: string; password: string }; result: Omit<User, 'password'> }>
    '/register': RequestAction<{ body: { email: string; password: string }; result: Omit<User, 'password'> }>
    '/googleLogin': RequestAction<{ body: { token: string }; result: Omit<User, 'password'> }>
    '/googleRegister': RequestAction<{ body: { token: string }; result: Omit<User, 'password'> }>
    '/attachGoogleAccount': RequestAction<{ body: { token: string }; result: Omit<User, 'password'> }>
    '/detachGoogleAccount': RequestAction<{ result: Omit<User, 'password'> }>
    '/githubLogin': RequestAction<{ body: { code: string; clientId: string }; result: Omit<User, 'password'> }>
    '/githubRegister': RequestAction<{ body: { code: string; clientId: string }; result: Omit<User, 'password'> }>
    '/attachGithubAccount': RequestAction<{ body: { code: string; clientId: string }; result: Omit<User, 'password'> }>
    '/detachGithubAccount': RequestAction<{ result: Omit<User, 'password'> }>
    '/logout': RequestAction<{}>
    '/accept-terms': RequestAction<{}>
    '/settings': RequestAction<{ body: UserSettings }>
    '/avatar': RequestAction<{}>
    '/changePassword': RequestAction<{
      body: { currentPassword: string; newPassword: string }
      result: { success: boolean }
    }>

    '/organizations': PostEndpoint<Organization>
    '/organization/:organizationName/addMember': RequestAction<{
      result: PartialResult<Organization, any>
      body: { username: string }
      urlParams: { organizationName: string }
    }>
    '/organization/:organizationName/removeMember': RequestAction<{
      result: PartialResult<Organization, any>
      body: { username: string }
      urlParams: { organizationName: string }
    }>
    '/organization/:organizationName/addAdmin': RequestAction<{
      result: PartialResult<Organization, any>
      body: { username: string }
      urlParams: { organizationName: string }
    }>
    '/organization/:organizationName/removeAdmin': RequestAction<{
      result: PartialResult<Organization, any>
      body: { username: string }
      urlParams: { organizationName: string }
    }>
  }
  PATCH: {
    '/organizations/:organizationName': RequestAction<{
      body: Partial<Organization>
      result: Organization
      urlParams: { organizationName: string }
    }>
    '/profiles/:id': PatchEndpoint<Profile>
    '/users/:id': PatchEndpoint<User>
  }
}
