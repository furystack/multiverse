import { Injectable } from '@furystack/inject'
import { ObservableValue } from '@furystack/utils'
import { PartialResult } from '@furystack/core'
import { XpenseApiService } from '@common/frontend-utils'
import Semaphore from 'semaphore-async-await'
import { xpense } from '@common/models'

@Injectable({ lifetime: 'singleton' })
export class AvailableAccountsContext {
  public accounts = new ObservableValue<Array<PartialResult<xpense.Account, keyof xpense.Account>>>([])

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
        action: '/accounts',
        query: {
          findOptions: {
            filter: {},
            select: ['_id', 'current', 'icon', 'name', 'ownerName', 'ownerType'],
            order: { name: 'ASC' },
          },
        },
      })
      this.accounts.setValue(accounts.entries)
    } finally {
      this.isLoading.setValue(false)
      this.loadLock.release()
    }
  }

  constructor(private readonly api: XpenseApiService) {
    this.reload()
  }
}
