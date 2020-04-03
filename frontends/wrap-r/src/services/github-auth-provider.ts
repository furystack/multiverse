import { Injectable } from '@furystack/inject'
import { WrapRApiService, SessionService } from 'common-frontend-utils'
import { tokens } from 'common-config/src'

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
          clientId: tokens.githubClientId,
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
        body: { code, clientId: tokens.githubClientId as string },
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
    await this.api.call({
      method: 'POST',
      action: '/attachGithubAccount',
      body: { clientId: tokens.githubClientId, code },
    })
  }

  /**
   *
   */
  constructor(private readonly session: SessionService, private readonly api: WrapRApiService) {}
}
