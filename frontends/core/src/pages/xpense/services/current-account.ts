import { Injectable } from '@furystack/inject'
import { ObservableValue } from '@furystack/utils'
import { xpense } from '@common/models'
import Semaphore from 'semaphore-async-await'

@Injectable()
export class CurrentAccountService {
  isLoading = new ObservableValue(false)
  value = new ObservableValue<xpense.Account | undefined>()
  loadLock = new Semaphore(1)
}
