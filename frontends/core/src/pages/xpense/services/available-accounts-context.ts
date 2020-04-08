import { Injectable } from '@furystack/inject'
import { XpenseApiService } from '@common/frontend-utils'

export interface AvailableAccount {
  name: string
  icon?: string
  ownerType: 'user' | 'organization'
  ownerName: string
  current: number
}

@Injectable({ lifetime: 'singleton' })
export class AvailableAccountsContext {
  public accounts!: Promise<AvailableAccount[]>

  public reload() {
    this.accounts = this.api.call({
      method: 'GET',
      action: '/availableAccounts',
    })
  }

  constructor(private readonly api: XpenseApiService) {
    this.reload()
  }
}
