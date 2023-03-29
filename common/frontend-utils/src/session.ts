import { Injector, Injectable, Injected } from '@furystack/inject'
import { ObservableValue, usingAsync } from '@furystack/utils'
import type { User as FUser } from '@furystack/core'
import { IdentityContext } from '@furystack/core'
import type { auth } from '@common/models'
import { NotyService } from '@furystack/shades-common-components'
import { useAuthApi } from './apis/auth-api'
import { getErrorMessage } from './get-error-message'
import { ThemeService } from './theme-service'

export type SessionState = 'initializing' | 'offline' | 'unauthenticated' | 'authenticated'

@Injectable({ lifetime: 'singleton' })
export class SessionService implements IdentityContext {
  private readonly operation = () => {
    this.isOperationInProgress.setValue(true)
    return { dispose: () => this.isOperationInProgress.setValue(false) }
  }

  public state = new ObservableValue<SessionState>('initializing')
  public currentUser = new ObservableValue<Omit<auth.User, 'password'> | null>(null)

  public isOperationInProgress = new ObservableValue(true)

  public loginError = new ObservableValue('')

  private isInitialized = false
  public async init() {
    if (!this.isInitialized) {
      this.isInitialized = true
      await usingAsync(this.operation(), async () => {
        try {
          const { result } = await useAuthApi(this.injector)({ method: 'GET', action: '/isAuthenticated' })
          this.state.setValue(result.isAuthenticated ? 'authenticated' : 'unauthenticated')
          if (result.isAuthenticated) {
            const { result: usr } = await useAuthApi(this.injector)({ method: 'GET', action: '/currentUser' })
            this.currentUser.setValue(usr)
          }
        } catch (error) {
          this.state.setValue('offline')
        }
      })
    }
  }

  public async login(username: string, password: string) {
    await usingAsync(this.operation(), async () => {
      try {
        const { result: usr } = await useAuthApi(this.injector)({
          method: 'POST',
          action: '/login',
          body: { username, password },
        })
        this.currentUser.setValue(usr)
        this.state.setValue('authenticated')
        this.notys.addNoty({
          body: 'Welcome back ;)',
          title: 'You have been logged in',
          type: 'success',
        })
      } catch (error) {
        const errorMsg = await getErrorMessage(error)
        this.loginError.setValue(errorMsg)
        this.notys.addNoty({
          body: 'Please check your credentials',
          title: 'Login failed',
          type: 'warning',
        })
      }
    })
  }

  public async logout() {
    await usingAsync(this.operation(), async () => {
      useAuthApi(this.injector)({ method: 'POST', action: '/logout' })
      this.currentUser.setValue(null)
      this.state.setValue('unauthenticated')
      this.notys.addNoty({
        body: 'Come back soon...',
        title: 'You have been logged out',
        type: 'info',
      })
    })
  }

  public async isAuthenticated(): Promise<boolean> {
    return this.state.getValue() === 'authenticated'
  }
  public async isAuthorized(...roles: string[]): Promise<boolean> {
    const currentUser = await this.getCurrentUser()
    for (const role of roles) {
      if (!currentUser || !currentUser.roles.some((c) => c === role)) {
        return false
      }
    }
    return true
  }
  public async getCurrentUser<TUser extends FUser>(): Promise<TUser> {
    const currentUser = this.currentUser.getValue()
    if (!currentUser) {
      this.notys.addNoty({
        body: ':(((',
        title: 'No User available',
        type: 'warning',
      })
      throw Error('No user available')
    }
    return currentUser as unknown as TUser
  }

  public reloadProfile = async () => {
    const username = this.currentUser.getValue()?.username
    if (username) {
      const { result: profile } = await useAuthApi(this.injector)({
        method: 'GET',
        action: '/profiles/:username',
        url: { username },
      })
      this.currentProfile.setValue(profile)
    } else {
      this.currentProfile.setValue(null as any)
    }
  }

  public currentProfileUpdate = this.currentUser.subscribe(() => this.reloadProfile())

  public currentProfile = new ObservableValue<auth.Profile>()

  public themeUpdater = this.currentProfile.subscribe((profile) => {
    if (profile?.userSettings) {
      this.themeService.setTheme(profile.userSettings.theme === 'dark' ? 'dark' : 'light')
    } else {
      this.themeService.setTheme('dark')
    }
  })

  public async acceptTerms() {
    try {
      const lastUser = this.currentUser.getValue() as auth.User
      useAuthApi(this.injector)({
        method: 'POST',
        action: '/accept-terms',
      })
      this.notys.addNoty({ type: 'success', title: 'Success', body: 'You have accepted the terms' })
      this.currentUser.setValue({ ...lastUser, roles: [...lastUser.roles, 'terms-accepted'] })
    } catch (error) {
      this.notys.addNoty({ type: 'success', title: 'Success', body: 'Something went wrong during accepting the Terms' })
    }
  }

  @Injected(NotyService)
  private readonly notys!: NotyService

  @Injected(ThemeService)
  private readonly themeService!: ThemeService

  @Injected(Injector)
  private readonly injector!: Injector
}

export const useSessionService = (injector: Injector) => {
  const service = injector.getInstance(SessionService)
  service.init()
  injector.setExplicitInstance(service, IdentityContext)
}
