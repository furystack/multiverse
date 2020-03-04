// import '@furystack/odata-fetchr/dist/injector-extensions'
import { Injectable, Injector } from '@furystack/inject'
import { User } from '../entity-types/user'

/**
 * Service class for collection users
 * File created by @furystack/odata-fetchr
 */
@Injectable({ lifetime: 'singleton' })
export class Users {
  /**
   * Custom collection action 'login'
   */
  public login = (params: { username: string; password: string }) =>
    this.getService().execCustomCollectionAction<User>('login', params)

  public googleLogin = (params: { token: string }) =>
    this.getService().execCustomCollectionAction<User>('googleLogin', params)

  public googleRegister = (params: { token: string }) =>
    this.getService().execCustomCollectionAction<User>('googleRegister', params)

  public githubLogin = (params: { code: string; clientId: string }) =>
    this.getService().execCustomCollectionAction<User>('githubLogin', params)

  public githubRegister = (params: { code: string; clientId: string }) =>
    this.getService().execCustomCollectionAction<User>('githubRegister', params)

  public register = (params: { email: string; password: string }) =>
    this.getService().execCustomCollectionAction<User>('register', params)

  /**
   * Custom collection action 'logout'
   */
  public logout = () => this.getService().execCustomCollectionAction('logout')
  /**
   * Custom collection action 'current'
   */
  public current = () => this.getService().execCustomCollectionFunction<User>('current')
  /**
   * Custom collection action 'isAuthenticated'
   */
  public isAuthenticated = () => this.getService().execCustomCollectionFunction<Record<string, any>>('isAuthenticated')
  public readonly entitySetUrl = 'users'
  public getService = () => this.injector.getOdataServiceFor(User, 'users')
  constructor(private injector: Injector) {}
}
