import { AbstractLogger, getLogger, LoggerCollection, LogLevel, useLogging } from '@furystack/logging'
import { getCurrentUser, isAuthorized, StoreManager } from '@furystack/core'
import { Injectable, Injector } from '@furystack/inject'
import { Disposable } from '@furystack/utils'
import { getRepository } from '@furystack/repository'
import { databases } from '@common/config'
import { MongodbStore, useMongoDb } from '@furystack/mongodb-store'
import { diag } from '@common/models'
import { ApplicationContextService } from './application-context'

@Injectable({ lifetime: 'singleton' })
export class DbLoggerSettings {
  public minLevel?: LogLevel

  public injector!: Injector
}

@Injectable({ lifetime: 'singleton' })
export class DbLogger extends AbstractLogger implements Disposable {
  private isDisposing = false

  public async dispose() {
    this.isDisposing = true
    this.injector.getInstance(LoggerCollection).detach(this)
    this.addEntry = () => Promise.resolve()
    await getLogger(this.injector)
      .withScope(this.constructor.name)
      .information({ message: 'Disposing, no logs will be saved to the DB...' })
  }
  public readonly store: MongodbStore<diag.LogEntry<any>, '_id'>
  public async addEntry<T>(entry: import('@furystack/logging').LeveledLogEntry<T>): Promise<void> {
    const { name: appName } = this.injector.getInstance(ApplicationContextService)
    if (!this.isDisposing) {
      if (entry.level >= (this.settings.minLevel || LogLevel.Information)) {
        await this.store.add({
          ...entry,
          creationDate: new Date(),
          appName,
        })
      }
    }
  }

  constructor(private injector: Injector, private readonly settings: DbLoggerSettings) {
    super()
    this.store = injector.getInstance(StoreManager).getStoreFor(diag.LogEntry, '_id')
  }
}

export const useDbLogger = (settings: DbLoggerSettings) => {
  useMongoDb({
    injector: settings.injector,
    primaryKey: '_id',
    model: diag.LogEntry,
    collection: databases.diag.logCollection,
    url: databases.diag.mongoUrl,
    db: databases.diag.dbName,
    options: { ...databases.standardOptions, maxPoolSize: 1, minPoolSize: 1 },
  })

  getRepository(settings.injector).createDataSet(diag.LogEntry, '_id', {
    authorizeAdd: async () => ({ isAllowed: false, message: 'The DataSet is read only' }),
    authorizeRemove: async () => ({ isAllowed: false, message: 'The DataSet is read only' }),
    authorizeUpdate: async () => ({ isAllowed: false, message: 'The DataSet is read only' }),
    authorizeGet: async (options) => {
      const result = await isAuthorized(options.injector, 'sys-diags')
      if (!result) {
        const user = await getCurrentUser(options.injector)
        getLogger(options.injector)
          .withScope('db-logger')
          .warning({ message: `User '${user.username}' tried to retrieve log entries without 'sys-diags' role` })
      }
      return {
        isAllowed: result,
        message: result ? '' : "Role 'sys-diags' required",
      }
    },
  })

  settings.injector.setExplicitInstance(settings, DbLoggerSettings)
  useLogging(settings.injector, DbLogger)
}
