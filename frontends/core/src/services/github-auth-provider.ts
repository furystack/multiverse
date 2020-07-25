import { Injectable } from '@furystack/inject'
import { AuthApiService, SessionService } from '@common/frontend-utils'

@Injectable({ lifetime: 'singleton' })
export class GithubAuthProvider {
  private async getClientId() {
    const oauthData = await this.api.call({
      method: 'GET',
      action: '/oauth-data',
    })
    return oauthData.githubClientId
  }

  public async login(code: string) {
    try {
      this.session.isOperationInProgress.setValue(true)
      const clientId = await this.getClientId()
      const user = await this.api.call({
        method: 'POST',
        action: '/githubLogin',
        body: {
          code,
          clientId,
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
      const clientId = await this.getClientId()
      const user = await this.api.call({
        method: 'POST',
        action: '/githubRegister',
        body: { code, clientId },
      })
      if (user) {
        this.session.currentUser.setValue(user)
        this.session.state.setValue('authenticated')
      }
    } finally {
      this.session.isOperationInProgress.setValue(false)
    }
  }

  public async attach(code: string) {
    const clientId = await this.getClientId()
    await this.api.call({
      method: 'POST',
      action: '/attachGithubAccount',
      body: { clientId, code },
    })
  }

  /**
   *
   */
  constructor(private readonly session: SessionService, private readonly api: AuthApiService) {}
}
