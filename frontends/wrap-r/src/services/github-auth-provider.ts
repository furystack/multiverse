import { Injectable } from '@furystack/inject'
import Semaphore from 'semaphore-async-await'
import { Users } from '../odata/entity-collections'
import { User } from '../odata/entity-types'
import { SessionService } from './session'

@Injectable({ lifetime: 'singleton' })
export class GithubAuthProvider {
  public loadLock = new Semaphore(1)

  public lastCode = ''

  public async login(code: string): Promise<User | void> {
    if (code !== this.lastCode) {
      await this.loadLock.acquire()
      try {
        if (code !== this.lastCode) {
          this.lastCode = code
          this.session.isOperationInProgress.setValue(true)
          const user = await this.users.githubLogin({ code, clientId: process.env.GITHUB_CLIENT_ID as string })
          if (user) {
            this.session.currentUser.setValue(user)
            this.session.state.setValue('authenticated')
            return user
          }
        }
      } finally {
        this.session.isOperationInProgress.setValue(false)
        this.loadLock.release()
      }
    }
  }

  /**
   *
   */
  constructor(private readonly session: SessionService, private readonly users: Users) {}
}
