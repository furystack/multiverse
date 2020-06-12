import { DefaultSession } from '@furystack/rest-service'
import '@furystack/mongodb-store'
import { Injector } from '@furystack/inject/dist/injector'
import { databases } from '@common/config'
import { auth } from '@common/models'
import { verifyAndCreateIndexes } from './create-indexes'
import { authorizedDataSet } from './authorized-data-set'

declare module '@furystack/inject/dist/injector' {
  interface Injector {
    useCommonHttpAuth: () => this
  }
}

Injector.prototype.useCommonHttpAuth = function () {
  this.setupStores((sm) =>
    sm
      .useMongoDb({
        model: auth.User,
        primaryKey: '_id',
        url: databases['common-auth'].mongoUrl,
        db: databases['common-auth'].dbName,
        collection: databases['common-auth'].usersCollection,
        options: databases.standardOptions,
      })
      .useMongoDb({
        primaryKey: '_id',
        model: auth.Organization,
        url: databases['common-auth'].mongoUrl,
        db: databases['common-auth'].dbName,
        collection: 'organizations',
        options: databases.standardOptions,
      })
      .useMongoDb({
        primaryKey: 'sessionId',
        model: auth.Session,
        url: databases['common-auth'].sessionStoreUrl,
        db: databases['common-auth'].dbName,
        collection: 'sessions',
        options: databases.standardOptions,
      }),
  ).useHttpAuthentication({
    enableBasicAuth: true,
    cookieName: 'fsmvsc',
    model: auth.User,
    getUserStore: (sm) => sm.getStoreFor(auth.User),
    getSessionStore: (sm) => sm.getStoreFor<DefaultSession>(auth.Session),
  })

  this.setupRepository((repo) =>
    repo
      .createDataSet(auth.Organization, {
        authorizeUpdateEntity: async ({ injector: i, entity }) => {
          const currentUser = await i.getCurrentUser()
          if (entity.ownerName === currentUser.username || entity.adminNames.includes(currentUser.username)) {
            return { isAllowed: true }
          }
          return { isAllowed: false, message: 'Only the owner or admins can modify an organization' }
        },
      })
      .createDataSet(auth.User, {
        ...authorizedDataSet,
        authorizeAdd: async (authorize) => {
          const success = await authorize.injector.isAuthorized('user-admin')
          return {
            isAllowed: success ? true : false,
            message: success ? '' : "Role 'user-admin' required.",
          }
        },
      }),
  )

  verifyAndCreateIndexes({
    injector: this,
    model: auth.User,
    indexSpecification: { username: 1 },
    indexName: 'username',
    indexOptions: { unique: true },
  })

  return this
}

export {}
