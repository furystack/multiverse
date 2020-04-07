import '@furystack/auth-google'
import { verifyAndCreateIndexes, getOrgsForCurrentUser } from 'common-service-utils'
import '@furystack/repository/dist/injector-extension'
import { ConsoleLogger } from '@furystack/logging'
import { Injector } from '@furystack/inject'
import { xpense, Organization } from 'common-models'
import { databases } from 'common-config'
import { HttpUserContext } from '@furystack/rest-service'

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
    })
    .useMongoDb({
      model: Organization,
      url: databases['common-auth'].mongoUrl,
      db: databases['common-auth'].dbName,
      collection: 'organizations',
      options: databases.standardOptions,
    }),
)

injector.setupRepository((repo) =>
  repo
    .createDataSet(xpense.Account, {
      name: 'accounts',
      addFilter: async ({ injector: i, filter }) => {
        const currentUser = await i.getInstance(HttpUserContext).getCurrentUser()
        const orgs = await getOrgsForCurrentUser(i, currentUser)
        return {
          ...filter,
          filter: {
            $and: [
              filter.filter,
              {
                $or: [
                  { ownerType: 'user', ownerName: currentUser.username },
                  ...orgs.map((org) => ({ ownerType: 'organization', ownerName: org.name })),
                ],
              },
            ],
          },
        } as typeof filter
      },
      authorizeGetEntity: async ({ entity, injector: i }) => {
        const currentUser = await i.getInstance(HttpUserContext).getCurrentUser()
        const orgs = await getOrgsForCurrentUser(i, currentUser)
        if (entity.ownerType === 'user' && entity.ownerName === currentUser.username) {
          return { isAllowed: true }
        }
        if (entity.ownerType === 'organization' && orgs.map((org) => org.name).includes(entity.ownerName)) {
          return { isAllowed: true }
        }
        return {
          isAllowed: false,
          message: 'To view this account, you or one of your organizations have to own it.',
        }
      },
    })
    .createDataSet(xpense.Item, {
      name: 'items',
    })
    .createDataSet(xpense.Replenishment, {
      name: 'replenishments',
      authorizeGetEntity: async ({ entity, injector: i }) => {
        await injector.getDataSetFor<Account>('accounts').get(i, entity.accountId)
        return { isAllowed: true }
      },
    })
    .createDataSet(xpense.Shop, {
      name: 'shops',
    })
    .createDataSet(xpense.Shopping, {
      name: 'shoppings',
      authorizeGetEntity: async ({ entity, injector: i }) => {
        await injector.getDataSetFor<Account>('accounts').get(i, entity.accountId)
        return { isAllowed: true }
      },
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
