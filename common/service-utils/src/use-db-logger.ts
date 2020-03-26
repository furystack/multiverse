import { AbstractLogger } from '@furystack/logging'
import { Injector } from '@furystack/inject/dist/injector'
import { StoreManager, globalDisposables } from '@furystack/core'
import { Injectable } from '@furystack/inject'
import { Disposable } from '@furystack/utils'
import { databases } from 'common-config'
import { MongodbStore } from '@furystack/mongodb-store'
import { LogEntry } from 'common-models'
import '@furystack/repository'
import { HttpUserContext } from '@furystack/rest-service'

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
      model: LogEntry,
      collection: databases.logging.logCollection,
      url: databases.logging.mongoUrl,
      db: databases.logging.dbName,
      options: {
        useUnifiedTopology: true,
      },
    }),
  )

  this.setupRepository((repo) =>
    repo.createDataSet(LogEntry, {
      authorizeUpdate: async () => ({ isAllowed: false, message: 'The Log is read only, updates are permitted!' }),
      authorizeGet: async ({ injector }) => {
        const isAllowed = await injector.getInstance(HttpUserContext).isAuthorized('sys-logs')
        if (!isAllowed) {
          return {
            isAllowed,
            message: "You need 'sys-logs' role to see the entries",
          }
        }
        return {
          isAllowed,
        }
      },
    }),
  )

  this.setExplicitInstance(settings, DbLoggerSettings)
  this.useLogging(DbLogger)
  const dbLogger = this.getInstance(DbLogger)
  globalDisposables.add(dbLogger)
  return this
}
