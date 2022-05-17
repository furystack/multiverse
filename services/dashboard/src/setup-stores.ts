import { Injector } from '@furystack/inject'
import { dashboard } from '@common/models'
import { databases } from '@common/config'
import { useMongoDb } from '@furystack/mongodb-store'

export const setupStores = (injector: Injector) => {
  useMongoDb({
    injector,
    primaryKey: '_id',
    model: dashboard.Dashboard,
    url: databases.dashboard.mongoUrl,
    db: databases.dashboard.dbName,
    collection: databases.dashboard.dashboards,
    options: databases.standardOptions,
  })
}
