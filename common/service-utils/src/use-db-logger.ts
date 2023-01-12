import { AbstractLogger, getLogger, LoggerCollection, LogLevel, useLogging } from '@furystack/logging'
import { getCurrentUser, isAuthorized, StoreManager } from '@furystack/core'
import type { Injector } from '@furystack/inject'
import { Injectable, Injected } from '@furystack/inject'
import type { Disposable } from '@furystack/utils'
import { getRepository } from '@furystack/repository'
import { databases } from '@common/config'
import { useMongoDb } from '@furystack/mongodb-store'
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

  @Injected(LoggerCollection)
  private readonly loggerCollection!: LoggerCollection

  @Injected(StoreManager)
  private readonly storeManager!: StoreManager

  @Injected(ApplicationContextService)
  private readonly applicationContextService!: ApplicationContextService

  @Injected(DbLoggerSettings)
  private readonly settings!: DbLoggerSettings

  public async dispose() {
    this.isDisposing = true
    this.loggerCollection.detach(this)
    this.addEntry = () => Promise.resolve()
    await this.loggerCollection
      .withScope(this.constructor.name)
      .information({ message: 'Disposing, no logs will be saved to the DB...' })
  }
  // eslint-disable-next-line @typescript-eslint/consistent-type-imports
  public async addEntry<T>(entry: import('@furystack/logging').LeveledLogEntry<T>): Promise<void> {
    const { name: appName } = this.applicationContextService
    if (!this.isDisposing) {
      if (entry.level >= (this.settings.minLevel || LogLevel.Information)) {
        await this.storeManager.getStoreFor(diag.LogEntry, '_id').add({
          ...entry,
          creationDate: new Date(),
          appName,
        })
      }
    }
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
    options: { maxPoolSize: 1, minPoolSize: 1 },
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
