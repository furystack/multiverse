import { Injectable } from '@furystack/inject'
import { v4 } from 'uuid'

const clientTokenName = 'multiverse-client-token'

@Injectable({ lifetime: 'singleton' })
export class RestParams {
  private _loadedToken?: string
  public getToken() {
    if (this._loadedToken) {
      return this._loadedToken
    }
    const token = localStorage.getItem(clientTokenName)
    if (!token) {
      const newToken = v4()
      localStorage.setItem(clientTokenName, newToken)
      return newToken
    }
    return token
  }
}
