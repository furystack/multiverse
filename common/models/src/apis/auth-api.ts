import { RestApi, GetCollectionEndpoint, PostEndpoint, PatchEndpoint, GetEntityEndpoint } from '@furystack/rest'
import { PartialResult } from '@furystack/core'
import { User } from '../auth/user'
import { Profile } from '../auth/profile'
import { Organization } from '../auth/organization'
import { GoogleAccount } from '../auth/google-account'
import { GithubAccount } from '../auth/github-account'
import { UserSettings } from '../auth'

export interface AuthApi extends RestApi {
  GET: {
    '/isAuthenticated': { result: { isAuthenticated: boolean } }
    '/currentUser': { result: User }
    '/loginProviderDetails': {
      result: { google?: GoogleAccount; github?: GithubAccount; hasPassword: boolean }
    }
    '/profiles/:username': { result: PartialResult<Profile, any>; url: { username: string } }
    '/profiles/:username/avatar': { result: any; url: { username: string } }
    '/profiles': GetCollectionEndpoint<Profile>
    '/organizations': GetCollectionEndpoint<Organization>
    '/organization/:organizationName': {
      result: PartialResult<Organization, any>
      url: { organizationName: string }
    }
    '/oauth-data': {
      result: {
        googleClientId: string
        githubClientId: string
      }
    }
    '/users': GetCollectionEndpoint<User>
    '/users/:id': GetEntityEndpoint<User>
  }
  POST: {
    '/login': { body: { username: string; password: string }; result: Omit<User, 'password'> }
    '/register': { body: { email: string; password: string }; result: Omit<User, 'password'> }
    '/googleLogin': { body: { token: string }; result: Omit<User, 'password'> }
    '/googleRegister': { body: { token: string }; result: Omit<User, 'password'> }
    '/attachGoogleAccount': { body: { token: string }; result: Omit<User, 'password'> }
    '/detachGoogleAccount': { result: Omit<User, 'password'> }
    '/githubLogin': { body: { code: string; clientId: string }; result: Omit<User, 'password'> }
    '/githubRegister': { body: { code: string; clientId: string }; result: Omit<User, 'password'> }
    '/attachGithubAccount': { body: { code: string; clientId: string }; result: Omit<User, 'password'> }
    '/detachGithubAccount': { result: Omit<User, 'password'> }
    '/logout': { result: unknown }
    '/accept-terms': { result: { success: boolean } }
    '/settings': { body: UserSettings; result: UserSettings }
    '/avatar': { result: { success: boolean } }
    '/changePassword': {
      body: { currentPassword: string; newPassword: string }
      result: { success: boolean }
    }

    '/organizations': PostEndpoint<Organization>
    '/organization/:organizationName/addMember': {
      result: PartialResult<Organization, any>
      body: { username: string }
      url: { organizationName: string }
    }
    '/organization/:organizationName/removeMember': {
      result: PartialResult<Organization, any>
      body: { username: string }
      url: { organizationName: string }
    }
    '/organization/:organizationName/addAdmin': {
      result: PartialResult<Organization, any>
      body: { username: string }
      url: { organizationName: string }
    }
    '/organization/:organizationName/removeAdmin': {
      result: PartialResult<Organization, any>
      body: { username: string }
      url: { organizationName: string }
    }
  }
  PATCH: {
    '/organizations/:organizationName': {
      body: Partial<Organization>
      result: Organization
      url: { organizationName: string }
    }
    '/profiles/:id': PatchEndpoint<Profile>
    '/users/:id': PatchEndpoint<User>
  }
}
