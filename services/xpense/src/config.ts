import '@furystack/auth-google'
import { verifyAndCreateIndexes } from 'common-service-utils'
import '@furystack/repository/dist/injector-extension'
import { ConsoleLogger } from '@furystack/logging'
import { Injector } from '@furystack/inject'
import { xpense } from 'common-models'
import { databases } from 'common-config'

export const injector = new Injector()

injector.useDbLogger({ appName: 'xpense' }).useLogging(ConsoleLogger)
injector.useCommonHttpAuth()
injector.setupStores((sm) =>
  sm
    .useMongoDb({
      model: xpense.Account,
      url: databases.xpense.mongoUrl,
      db: databases.xpense.dbName,
      collection: databases.xpense.accounts,
      options: databases.standardOptions,
    })
    .useMongoDb({
      model: xpense.Item,
      url: databases.xpense.mongoUrl,
      db: databases.xpense.dbName,
      collection: databases.xpense.items,
      options: databases.standardOptions,
    })
    .useMongoDb({
      model: xpense.Replenishment,
      url: databases.xpense.mongoUrl,
      db: databases.xpense.dbName,
      collection: databases.xpense.replenishments,
      options: databases.standardOptions,
    })
    .useMongoDb({
      model: xpense.Shop,
      url: databases.xpense.mongoUrl,
      db: databases.xpense.dbName,
      collection: databases.xpense.shops,
      options: databases.standardOptions,
    })
    .useMongoDb({
      model: xpense.Shopping,
      url: databases.xpense.mongoUrl,
      db: databases.xpense.dbName,
      collection: databases.xpense.shoppings,
      options: databases.standardOptions,
    }),
)

injector.setupRepository((repo) =>
  repo
    .createDataSet(xpense.Account, {
      name: 'accounts',
    })
    .createDataSet(xpense.Item, {
      name: 'items',
    })
    .createDataSet(xpense.Replenishment, {
      name: 'replenishments',
    })
    .createDataSet(xpense.Shop, {
      name: 'shops',
    })
    .createDataSet(xpense.Shopping, {
      name: 'shoppings',
    }),
)

verifyAndCreateIndexes({
  injector,
  model: xpense.Item,
  indexName: 'itemName',
  indexSpecification: { name: 1 },
  indexOptions: { unique: true },
})
verifyAndCreateIndexes({
  injector,
  model: xpense.Shop,
  indexName: 'shopName',
  indexSpecification: { name: 1 },
  indexOptions: { unique: true },
})

verifyAndCreateIndexes({
  injector,
  model: xpense.Account,
  indexName: 'balanceOwner',
  indexSpecification: { ownerName: 1, ownerType: 1, name: 1 },
  indexOptions: { unique: true },
})
