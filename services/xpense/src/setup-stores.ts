import { Injector } from '@furystack/inject'
import { xpense } from '@common/models'
import { databases } from '@common/config'
import { useMongoDb } from '@furystack/mongodb-store'

export const setupStores = (injector: Injector) => {
  useMongoDb({
    injector,
    primaryKey: '_id',
    model: xpense.Account,
    url: databases.xpense.mongoUrl,
    db: databases.xpense.dbName,
    collection: databases.xpense.accounts,
    options: databases.standardOptions,
  })
  useMongoDb({
    injector,
    primaryKey: '_id',
    model: xpense.Item,
    url: databases.xpense.mongoUrl,
    db: databases.xpense.dbName,
    collection: databases.xpense.items,
    options: databases.standardOptions,
  })
  useMongoDb({
    injector,
    primaryKey: '_id',
    model: xpense.Replenishment,
    url: databases.xpense.mongoUrl,
    db: databases.xpense.dbName,
    collection: databases.xpense.replenishments,
    options: databases.standardOptions,
  })
  useMongoDb({
    injector,
    primaryKey: '_id',
    model: xpense.Shop,
    url: databases.xpense.mongoUrl,
    db: databases.xpense.dbName,
    collection: databases.xpense.shops,
    options: databases.standardOptions,
  })
  useMongoDb({
    injector,
    primaryKey: '_id',
    model: xpense.Shopping,
    url: databases.xpense.mongoUrl,
    db: databases.xpense.dbName,
    collection: databases.xpense.shoppings,
    options: databases.standardOptions,
  })
  // ???
  //   .useMongoDb({
  //     primaryKey: '_id',
  //     model: auth.Organization,
  //     url: databases['common-auth'].mongoUrl,
  //     db: databases['common-auth'].dbName,
  //     collection: 'organizations',
  //     options: databases.standardOptions,
  //   }),
}
