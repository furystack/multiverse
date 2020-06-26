import '@furystack/auth-google'
import { getOrgsForCurrentUser, AuthorizeOwnership } from '@common/service-utils'
import '@furystack/repository/dist/injector-extension'
import { VerboseConsoleLogger } from '@furystack/logging'
import { Injector } from '@furystack/inject'
import { xpense, auth } from '@common/models'
import { databases } from '@common/config'

export const injector = new Injector()

injector.useDbLogger({ appName: 'xpense' }).useLogging(VerboseConsoleLogger)
injector.useCommonHttpAuth()
injector.setupStores((sm) =>
  sm
    .useMongoDb({
      primaryKey: '_id',
      model: xpense.Account,
      url: databases.xpense.mongoUrl,
      db: databases.xpense.dbName,
      collection: databases.xpense.accounts,
      options: databases.standardOptions,
    })
    .useMongoDb({
      primaryKey: '_id',
      model: xpense.Item,
      url: databases.xpense.mongoUrl,
      db: databases.xpense.dbName,
      collection: databases.xpense.items,
      options: databases.standardOptions,
    })
    .useMongoDb({
      primaryKey: '_id',
      model: xpense.Replenishment,
      url: databases.xpense.mongoUrl,
      db: databases.xpense.dbName,
      collection: databases.xpense.replenishments,
      options: databases.standardOptions,
    })
    .useMongoDb({
      primaryKey: '_id',
      model: xpense.Shop,
      url: databases.xpense.mongoUrl,
      db: databases.xpense.dbName,
      collection: databases.xpense.shops,
      options: databases.standardOptions,
    })
    .useMongoDb({
      primaryKey: '_id',
      model: xpense.Shopping,
      url: databases.xpense.mongoUrl,
      db: databases.xpense.dbName,
      collection: databases.xpense.shoppings,
      options: databases.standardOptions,
    })
    .useMongoDb({
      primaryKey: '_id',
      model: auth.Organization,
      url: databases['common-auth'].mongoUrl,
      db: databases['common-auth'].dbName,
      collection: 'organizations',
      options: databases.standardOptions,
    }),
)

injector.setupRepository((repo) =>
  repo
    .createDataSet(xpense.Account, {
      addFilter: async ({ injector: i, filter }) => {
        const currentUser = await i.getCurrentUser()
        const orgs = await getOrgsForCurrentUser(i, currentUser)
        return {
          ...filter,
          filter: {
            $and: [
              filter.filter,
              {
                $or: [
                  { 'owner.type': 'user', 'owner.username': currentUser.username },
                  ...orgs.map((org) => ({ 'owner.type': 'organization', 'owner.organizationName': org.name })),
                ],
              },
            ],
          },
        } as typeof filter
      },
      modifyOnAdd: async ({ injector: i, entity }) => {
        const currentUser = await i.getCurrentUser()
        return {
          ...entity,
          createdBy: currentUser.username,
          creationDate: new Date().toISOString(),
        }
      },
      authorizeAdd: async ({ injector: i, entity }) => {
        const currentUser = await i.getCurrentUser()
        if (entity.owner?.type === 'user' && entity.owner?.username === currentUser.username) {
          return {
            isAllowed: true,
          }
        }
        if (entity.owner?.type === 'organization') {
          const orgs = await getOrgsForCurrentUser(i, currentUser)
          if (
            orgs.some(
              (org) =>
                (entity.owner?.type === 'organization' && org.name === entity.owner?.organizationName) ||
                !org.adminNames.includes(currentUser.username),
            )
          ) {
            return {
              isAllowed: true,
            }
          }
        }

        return {
          isAllowed: false,
          message: 'You can add user accounts only for yourself and organization accounts only if you are an admin',
        }
      },
      authorizeGetEntity: AuthorizeOwnership({ level: ['admin', 'member', 'owner', 'organizationOwner'] }),
    })
    .createDataSet(xpense.Item, {})
    .createDataSet(xpense.Replenishment, {
      authorizeGetEntity: async ({ entity, injector: i }) => {
        await injector.getDataSetFor(xpense.Account).get(i, entity.accountId)
        return { isAllowed: true }
      },
      authorizeRemove: async () => ({ isAllowed: false, message: 'Replenishments are permanent.' }),
      authorizeUpdate: async () => ({ isAllowed: false, message: 'Replenishments are read-only.' }),
    })
    .createDataSet(xpense.Shop, {})
    .createDataSet(xpense.Shopping, {
      authorizeGetEntity: async ({ entity, injector: i }) => {
        await injector.getDataSetFor(xpense.Account).get(i, entity.accountId)
        return { isAllowed: true }
      },
      authorizeRemove: async () => ({ isAllowed: false, message: 'Shoppings are permanent.' }),
      authorizeUpdate: async () => ({ isAllowed: false, message: 'Shoppings are read-only.' }),
    }),
)
