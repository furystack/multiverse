import { Injectable } from '@furystack/inject'
import { ObservableValue, usingAsync } from '@furystack/utils'
import { IdentityContext, User as FUser } from '@furystack/core'
import { auth } from '@common/models'
import {
  NotyService,
  ThemeProviderService,
  defaultDarkTheme,
  defaultLightTheme,
} from '@furystack/shades-common-components'
import { AuthApiService } from './apis/auth-api'
import { getErrorMessage } from './get-error-message'

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
  private async init() {
    await usingAsync(this.operation(), async () => {
      try {
        const { result } = await this.api.call({ method: 'GET', action: '/isAuthenticated' })
        this.state.setValue(result.isAuthenticated ? 'authenticated' : 'unauthenticated')
        if (result.isAuthenticated) {
          const { result: usr } = await this.api.call({ method: 'GET', action: '/currentUser' })
          this.currentUser.setValue(usr)
        }
      } catch (error) {
        this.state.setValue('offline')
      }
    })
  }

  public async login(username: string, password: string) {
    await usingAsync(this.operation(), async () => {
      try {
        const { result: usr } = await this.api.call({ method: 'POST', action: '/login', body: { username, password } })
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
      this.api.call({ method: 'POST', action: '/logout' })
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

  public currentProfileUpdate = this.currentUser.subscribe(async (usr) => {
    if (usr) {
      const { result: profile } = await this.api.call({
        method: 'GET',
        action: '/profiles/:username',
        url: { username: usr.username },
      })
      this.currentProfile.setValue(profile)
    } else {
      this.currentProfile.setValue(null as any)
    }
  })

  public currentProfile = new ObservableValue<auth.Profile>()

  public themeUpdater = this.currentProfile.subscribe((profile) => {
    if (profile?.userSettings) {
      this.themeProvider.theme.setValue(profile.userSettings.theme === 'dark' ? defaultDarkTheme : defaultLightTheme)
    } else {
      this.themeProvider.theme.setValue(defaultDarkTheme)
    }
  })

  public async acceptTerms() {
    try {
      const lastUser = this.currentUser.getValue() as auth.User
      this.api.call({
        method: 'POST',
        action: '/accept-terms',
      })
      this.notys.addNoty({ type: 'success', title: 'Success', body: 'You have accepted the terms' })
      this.currentUser.setValue({ ...lastUser, roles: [...lastUser?.roles, 'terms-accepted'] })
    } catch (error) {
      this.notys.addNoty({ type: 'success', title: 'Success', body: 'Something went wrong during accepting the Terms' })
    }
  }

  constructor(
    private api: AuthApiService,
    private readonly notys: NotyService,
    private readonly themeProvider: ThemeProviderService,
  ) {
    this.init()
  }
}
