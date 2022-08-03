import { Injectable, Injected, Injector } from '@furystack/inject'
import { useAuthApi, SessionService } from '@common/frontend-utils'

@Injectable({ lifetime: 'transient' })
export class GithubAuthProvider {
  private async getClientId() {
    const { result: oauthData } = await useAuthApi(this.injector)({
      method: 'GET',
      action: '/oauth-data',
    })
    return oauthData.githubClientId
  }

  public async login(code: string) {
    try {
      this.session.isOperationInProgress.setValue(true)
      const clientId = await this.getClientId()
      const { result: user } = await useAuthApi(this.injector)({
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
      const { result: user } = await useAuthApi(this.injector)({
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
    await useAuthApi(this.injector)({
      method: 'POST',
      action: '/attachGithubAccount',
      body: { clientId, code },
    })
  }

  @Injected(SessionService)
  private readonly session!: SessionService

  @Injected(Injector)
  private readonly injector!: Injector
}
