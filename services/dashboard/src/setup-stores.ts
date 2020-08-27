import { Injector } from '@furystack/inject'
import { dashboard } from '@common/models'
import { databases } from '@common/config'
import '@furystack/mongodb-store'

export const setupStores = (injector: Injector) => {
  injector.setupStores((sm) =>
    sm.useMongoDb({
      primaryKey: '_id',
      model: dashboard.Dashboard,
      url: databases.dashboard.mongoUrl,
      db: databases.dashboard.dbName,
      collection: databases.dashboard.dashboards,
      options: databases.standardOptions,
    }),
  )
}
