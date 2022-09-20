import { Injector } from '@furystack/inject'
import { auth } from '@common/models'
import { databases } from '@common/config'
import { useMongoDb } from '@furystack/mongodb-store'

export const setupStores = (injector: Injector) => {
  useMongoDb({
    injector,
    primaryKey: '_id',
    model: auth.GoogleAccount,
    url: databases['common-auth'].mongoUrl,
    db: databases['common-auth'].dbName,
    collection: 'google-accounts',
  })
  useMongoDb({
    injector,
    primaryKey: '_id',
    model: auth.GithubAccount,
    url: databases['common-auth'].mongoUrl,
    db: databases['common-auth'].dbName,
    collection: 'github-accounts',
  })
  useMongoDb({
    injector,
    primaryKey: '_id',
    model: auth.Profile,
    url: databases['common-auth'].mongoUrl,
    db: databases['common-auth'].dbName,
    collection: 'profiles',
  })
}
