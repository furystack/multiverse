import { Injectable } from '@furystack/inject'
import { Users } from '../odata/entity-collections'
import { SessionService } from './session'

@Injectable({ lifetime: 'singleton' })
export class GithubAuthProvider {
  public async login(code: string) {
    try {
      this.session.isOperationInProgress.setValue(true)
      const user = await this.users.githubLogin({ code, clientId: process.env.GITHUB_CLIENT_ID as string })
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
      const user = await this.users.githubRegister({ code, clientId: process.env.GITHUB_CLIENT_ID as string })
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
  constructor(private readonly session: SessionService, private readonly users: Users) {}
}
