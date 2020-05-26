import { Injectable } from '@furystack/inject'
import { ObservableValue } from '@furystack/utils'
import { XpenseApiService } from '@common/frontend-utils'
import Semaphore from 'semaphore-async-await'

export interface AvailableAccount {
  name: string
  icon?: string
  ownerType: 'user' | 'organization'
  ownerName: string
  current: number
}

@Injectable({ lifetime: 'singleton' })
export class AvailableAccountsContext {
  public accounts = new ObservableValue<AvailableAccount[]>([])

  public isLoading = new ObservableValue<boolean>(false)
  public loadLock = new Semaphore(1)

  public async reload() {
    if (!this.loadLock.getPermits()) {
      return
    }
    try {
      this.isLoading.setValue(true)
      await this.loadLock.acquire()
      const accounts = await this.api.call({
        method: 'GET',
        action: '/availableAccounts',
      })
      this.accounts.setValue(accounts)
    } finally {
      this.isLoading.setValue(false)
      this.loadLock.release()
    }
  }

  constructor(private readonly api: XpenseApiService) {
    this.reload()
  }
}
