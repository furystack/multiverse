import { Injectable } from '@furystack/inject'
import { ObservableValue, usingAsync } from '@furystack/utils'
import { User } from 'common-models'
import { WrapRApiService } from './apis/wrap-r-api'
import { getErrorMessage } from './get-error-message'

export type sessionState = 'initializing' | 'offline' | 'unauthenticated' | 'authenticated'

@Injectable({ lifetime: 'singleton' })
export class SessionService {
  private readonly operation = () => {
    this.isOperationInProgress.setValue(true)
    return { dispose: () => this.isOperationInProgress.setValue(false) }
  }

  public state = new ObservableValue<sessionState>('initializing')
  public currentUser = new ObservableValue<User | null>(null)

  public isOperationInProgress = new ObservableValue(true)

  public loginError = new ObservableValue('')
  private async init() {
    await usingAsync(this.operation(), async () => {
      try {
        const { isAuthenticated } = await this.api.call({ method: 'GET', action: '/isAuthenticated' })
        this.state.setValue(isAuthenticated ? 'authenticated' : 'unauthenticated')
        if (isAuthenticated) {
          const usr = await this.api.call({ method: 'GET', action: '/currentUser' })
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
        const usr = await this.api.call({ method: 'POST', action: '/login', body: { username, password } })
        this.currentUser.setValue(usr)
        this.state.setValue('authenticated')
      } catch (error) {
        const errorMsg = await getErrorMessage(error)
        this.loginError.setValue(errorMsg)
      }
    })
  }

  public async logout() {
    await usingAsync(this.operation(), async () => {
      this.api.call({ method: 'POST', action: '/logout' })
      this.currentUser.setValue(null)
      this.state.setValue('unauthenticated')
    })
  }

  constructor(private api: WrapRApiService) {
    this.init()
  }
}
