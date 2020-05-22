import { DefaultSession } from '@furystack/rest-service'
import '@furystack/mongodb-store'
import { Injector } from '@furystack/inject/dist/injector'
import { databases } from '@common/config'
import { Session, User, Organization } from '@common/models'
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
        model: User,
        primaryKey: '_id',
        url: databases['common-auth'].mongoUrl,
        db: databases['common-auth'].dbName,
        collection: databases['common-auth'].usersCollection,
        options: databases.standardOptions,
      })
      .useMongoDb({
        primaryKey: '_id',
        model: Organization,
        url: databases['common-auth'].mongoUrl,
        db: databases['common-auth'].dbName,
        collection: 'organizations',
        options: databases.standardOptions,
      })
      .useMongoDb({
        primaryKey: '_id',
        model: Session,
        url: databases['common-auth'].sessionStoreUrl,
        db: databases['common-auth'].dbName,
        collection: 'sessions',
        options: databases.standardOptions,
      }),
  ).useHttpAuthentication({
    enableBasicAuth: true,
    cookieName: 'fsmvsc',
    model: User,
    getUserStore: (sm) => sm.getStoreFor(User),
    getSessionStore: (sm) => sm.getStoreFor<DefaultSession>(Session),
  })

  this.setupRepository((repo) =>
    repo
      .createDataSet(Organization, {
        name: 'organizations',
        authorizeUpdateEntity: async ({ injector: i, entity }) => {
          const currentUser = await i.getCurrentUser()
          if (entity.ownerName === currentUser.username || entity.adminNames.includes(currentUser.username)) {
            return { isAllowed: true }
          }
          return { isAllowed: false, message: 'Only the owner or admins can modify an organization' }
        },
      })
      .createDataSet(User, {
        ...authorizedDataSet,
        authorizeAdd: async (authorize) => {
          const success = await authorize.injector.isAuthorized('user-admin')
          return {
            isAllowed: success ? true : false,
            message: success ? '' : "Role 'user-admin' required.",
          }
        },
        name: 'users',
      }),
  )

  verifyAndCreateIndexes({
    injector: this,
    model: User,
    indexSpecification: { username: 1 },
    indexName: 'username',
    indexOptions: { unique: true },
  })

  verifyAndCreateIndexes({
    injector: this,
    model: Session,
    indexSpecification: { sessionId: 1 },
    indexName: 'sessionId',
    indexOptions: { unique: true },
  })

  return this
}

export {}
