import { AbstractLogger } from '@furystack/logging'
import { Injector } from '@furystack/inject/dist/injector'
import { StoreManager, globalDisposables } from '@furystack/core'
import { Injectable } from '@furystack/inject'
import { Disposable } from '@furystack/utils'
import { databases } from 'sites'
import { MongodbStore } from '@furystack/mongodb-store'
import { LogEntry } from 'common-models'

@Injectable({ lifetime: 'singleton' })
export class DbLogger extends AbstractLogger implements Disposable {
  private isDisposing = false

  public async dispose() {
    await this.injector.logger
      .withScope(this.constructor.name)
      .information({ message: 'Disposing, no logs will be saved to the DB...' })
    this.isDisposing = true
  }
  public readonly store: MongodbStore<LogEntry<any>>
  public async addEntry<T>(entry: import('@furystack/logging').LeveledLogEntry<T>): Promise<void> {
    !this.isDisposing &&
      (await this.store.add({
        ...entry,
        creationDate: new Date(),
      } as LogEntry<T>))
  }

  constructor(private injector: Injector) {
    super()
    this.store = injector.getInstance(StoreManager).getStoreFor(LogEntry)
  }
}

declare module '@furystack/inject/dist/injector' {
  interface Injector {
    useDbLogger: () => Injector
  }
}

Injector.prototype.useDbLogger = function() {
  this.setupStores(sm =>
    sm.useMongoDb({
      model: LogEntry,
      collection: 'multiverse-log',
      url: databases.logs,
      db: 'logging',
    }),
  )
  this.useLogging(DbLogger)
  const dbLogger = this.getInstance(DbLogger)
  globalDisposables.add(dbLogger)
  return this
}
