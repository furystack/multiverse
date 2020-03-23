import { LogLevel } from '@furystack/logging'
import { ObservableValue, debounce } from '@furystack/utils'
import { Injectable } from '@furystack/inject'
import { LoggREntryQuerySettings, LogEntry } from 'common-models'
import { LoggRApiService } from 'common-frontend-utils'
import Semaphore from 'semaphore-async-await'

export const defaultLoggrQuerySettings: LoggREntryQuerySettings = {
  levels: [LogLevel.Error, LogLevel.Fatal, LogLevel.Warning, LogLevel.Information],
  orderBy: 'creationDate',
  orderDirection: 'DESC',
}

@Injectable({ lifetime: 'singleton' })
export class LoggREntries {
  public readonly settings: ObservableValue<LoggREntryQuerySettings> = new ObservableValue(defaultLoggrQuerySettings)

  public readonly error: ObservableValue<Error | undefined> = new ObservableValue()

  public readonly entries: ObservableValue<Array<LogEntry<any>>> = new ObservableValue([] as Array<LogEntry<any>>)

  private readonly loadLock = new Semaphore(1)

  public readonly fetch = debounce(async () => {
    await this.loadLock.acquire()
    try {
      const entries = await this.api.call({
        method: 'GET',
        action: '/entries',
        query: { filter: JSON.stringify(this.settings.getValue()) },
      })
      this.entries.setValue(entries)
      this.error.setValue(undefined)
    } catch (error) {
      this.error.setValue(error)
    } finally {
      this.loadLock.release()
    }
  }, 500)

  constructor(private api: LoggRApiService) {
    this.settings.subscribe(this.fetch)
    this.fetch()
  }
}
