import { RequestAction, RestApi } from '@furystack/rest'
import { User } from '../user'

export interface WrapRApi extends RestApi {
  GET: {
    '/isAuthenticated': RequestAction<{ result: { isAuthenticated: boolean } }>
    '/currentUser': RequestAction<{ result: User }>
  }
  POST: {
    '/login': RequestAction<{ body: { username: string; password: string }; result: User }>
    '/register': RequestAction<{ body: { email: string; password: string }; result: User }>
    '/googleLogin': RequestAction<{ body: { token: string }; result: User }>
    '/googleRegister': RequestAction<{ body: { token: string }; result: User }>
    '/githubLogin': RequestAction<{ body: { code: string; clientId: string }; result: User }>
    '/githubRegister': RequestAction<{ body: { code: string; clientId: string }; result: User }>
    '/logout': RequestAction<{}>
  }
}
