import { AbstractLogger, LoggerCollection } from '@furystack/logging'
import { Injector } from '@furystack/inject/dist/injector'
import { StoreManager } from '@furystack/core'
import { Injectable } from '@furystack/inject'
import { Disposable } from '@furystack/utils'
import { databases } from '@common/config'
import { MongodbStore } from '@furystack/mongodb-store'
import { LogEntry } from '@common/models'
import '@furystack/repository'

@Injectable({ lifetime: 'singleton' })
export class DbLoggerSettings {
  public appName!: string
}

@Injectable({ lifetime: 'singleton' })
export class DbLogger extends AbstractLogger implements Disposable {
  private isDisposing = false

  public async dispose() {
    await this.injector.logger
      .withScope(this.constructor.name)
      .information({ message: 'Disposing, no logs will be saved to the DB...' })
    this.isDisposing = true
    this.injector.getInstance(LoggerCollection).detach(this)
    this.addEntry = () => Promise.resolve()
  }
  public readonly store: MongodbStore<LogEntry<any>>
  public async addEntry<T>(entry: import('@furystack/logging').LeveledLogEntry<T>): Promise<void> {
    !this.isDisposing &&
      (await this.store.add({
        ...entry,
        creationDate: new Date(),
        appName: this.settings.appName,
      } as LogEntry<T>))
  }

  constructor(private injector: Injector, private readonly settings: DbLoggerSettings) {
    super()
    this.store = injector.getInstance(StoreManager).getStoreFor(LogEntry)
  }
}

declare module '@furystack/inject/dist/injector' {
  interface Injector {
    useDbLogger: (settings: DbLoggerSettings) => Injector
  }
}

Injector.prototype.useDbLogger = function (settings) {
  this.setupStores((sm) =>
    sm.useMongoDb({
      primaryKey: '_id',
      model: LogEntry,
      collection: databases.logging.logCollection,
      url: databases.logging.mongoUrl,
      db: databases.logging.dbName,
      options: databases.standardOptions,
    }),
  )

  this.setupRepository((repo) =>
    repo.createDataSet(LogEntry, {
      name: 'logEntries',
      authorizeAdd: async () => ({ isAllowed: false, message: 'The DataSet is read only' }),
      authorizeRemove: async () => ({ isAllowed: false, message: 'The DataSet is read only' }),
      authorizeUpdate: async () => ({ isAllowed: false, message: 'The DataSet is read only' }),
      authorizeGet: async (options) => {
        const result = await options.injector.isAuthorized('sys-logs')
        return {
          isAllowed: result,
          message: result ? '' : "Role 'sys-logs' required",
        }
      },
    }),
  )

  this.setExplicitInstance(settings, DbLoggerSettings)
  this.useLogging(DbLogger)
  return this
}
