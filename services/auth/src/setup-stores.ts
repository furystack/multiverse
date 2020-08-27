import { Injector } from '@furystack/inject'
import { auth } from '@common/models'
import { databases } from '@common/config'
import '@furystack/mongodb-store'
import '@common/service-utils'

export const setupStores = (injector: Injector) => {
  injector.setupStores((sm) =>
    sm
      .useMongoDb({
        primaryKey: '_id',
        model: auth.GoogleAccount,
        url: databases['common-auth'].mongoUrl,
        db: databases['common-auth'].dbName,
        collection: 'google-accounts',
        options: databases.standardOptions,
      })
      .useMongoDb({
        primaryKey: '_id',
        model: auth.GithubAccount,
        url: databases['common-auth'].mongoUrl,
        db: databases['common-auth'].dbName,
        collection: 'github-accounts',
        options: databases.standardOptions,
      })
      .useMongoDb({
        primaryKey: '_id',
        model: auth.Profile,
        url: databases['common-auth'].mongoUrl,
        db: databases['common-auth'].dbName,
        collection: 'profiles',
        options: databases.standardOptions,
      }),
  )
}
