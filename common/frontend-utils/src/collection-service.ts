import { PartialResult, SearchOptions } from '@furystack/core'
import Semaphore from 'semaphore-async-await'
import { Disposable, debounce, ObservableValue } from '@furystack/utils'

export type EntryLoader<T> = <TFields extends Array<keyof T>>(
  searchOptions: SearchOptions<T, TFields>,
) => Promise<{ count: number; entries: Array<PartialResult<T, TFields[number]>> }>

export class CollectionService<T> implements Disposable {
  public dispose() {
    this.querySettings.dispose()
    this.entries.dispose()
    this.error.dispose()
    this.isLoading.dispose()
  }

  private readonly loadLock = new Semaphore(1)

  public getEntries: EntryLoader<T>

  public entries = new ObservableValue<T[]>([])

  public error = new ObservableValue<Error | undefined>(undefined)

  public isLoading = new ObservableValue<boolean>(false)

  public querySettings: ObservableValue<SearchOptions<T, any>>

  constructor(fetch: EntryLoader<T>, defaultSettings: SearchOptions<T, any>) {
    this.querySettings = new ObservableValue<SearchOptions<T, any>>(defaultSettings)
    this.getEntries = debounce(async (options) => {
      await this.loadLock.acquire()
      try {
        this.isLoading.setValue(true)
        const result = await fetch(options)
        this.entries.setValue(result.entries)
        this.error.setValue(undefined)
        return result
      } catch (error) {
        this.error.setValue(error)
        throw error
      } finally {
        this.loadLock.release()
        this.isLoading.setValue(false)
      }
    }, 500)
    this.querySettings.subscribe((val) => this.getEntries(val), true)
  }
}
