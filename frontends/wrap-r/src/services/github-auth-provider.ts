import { Injectable } from '@furystack/inject'
import { WrapRApiService } from '../services/wrap-r-api'
import { SessionService } from './session'

@Injectable({ lifetime: 'singleton' })
export class GithubAuthProvider {
  public async login(code: string) {
    try {
      this.session.isOperationInProgress.setValue(true)
      const user = await this.api.call({
        method: 'POST',
        action: '/githubLogin',
        body: {
          code,
          clientId: process.env.MULTIVERSE_TOKEN_githubClientId as string,
        },
      })
      if (user) {
        this.session.currentUser.setValue(user)
        this.session.state.setValue('authenticated')
      }
    } finally {
      this.session.isOperationInProgress.setValue(false)
    }
  }

  public async register(code: string) {
    try {
      this.session.isOperationInProgress.setValue(true)
      const user = await this.api.call({
        method: 'POST',
        action: '/githubRegister',
        body: { code, clientId: process.env.GITHUB_CLIENT_ID as string },
      })
      if (user) {
        this.session.currentUser.setValue(user)
        this.session.state.setValue('authenticated')
      }
    } finally {
      this.session.isOperationInProgress.setValue(false)
    }
  }

  /**
   *
   */
  constructor(private readonly session: SessionService, private readonly api: WrapRApiService) {}
}
