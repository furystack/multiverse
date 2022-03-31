import '@furystack/mongodb-store'
import { Injector } from '@furystack/inject/dist/injector'
import { PasswordCredential } from '@furystack/security'
import { databases } from '@common/config'
import { auth } from '@common/models'
import { verifyAndCreateIndexes } from './create-indexes'
import { authorizedDataSet } from './authorized-data-set'

declare module '@furystack/inject/dist/injector' {
  // eslint-disable-next-line no-shadow
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
        primaryKey: '_id',
        model: auth.Session,
        url: databases['common-auth'].sessionStoreUrl,
        db: databases['common-auth'].dbName,
        collection: 'sessions',
        options: databases.standardOptions,
      })
      .useMongoDb({
        primaryKey: 'userName',
        model: PasswordCredential,
        url: databases['common-auth'].sessionStoreUrl,
        db: databases['common-auth'].dbName,
        collection: 'passwordCredentials',
        options: databases.standardOptions,
      }),
  )
    .useHttpAuthentication({
      enableBasicAuth: false,
      cookieName: 'fsmvsc',
      model: auth.User,
      getUserStore: (sm) => sm.getStoreFor(auth.User, '_id'),
      getSessionStore: (sm) => sm.getStoreFor(auth.Session, '_id'),
    })
    .usePasswordPolicy()

  this.setupRepository((repo) =>
    repo
      .createDataSet(auth.Organization, '_id', {
        authorizeUpdateEntity: async ({ injector: i, entity }) => {
          const currentUser = await i.getCurrentUser()
          if (
            (entity.owner.type === 'user' && entity.owner.username === currentUser.username) ||
            entity.adminNames.includes(currentUser.username)
          ) {
            return { isAllowed: true }
          }
          await i.logger.withScope('common-auth').warning({
            message: `User '${currentUser.username}' tried to modify organization '${entity.name}' without owning it or beign an admin`,
          })
          return { isAllowed: false, message: 'Only the owner or admins can modify an organization' }
        },
      })
      .createDataSet(auth.User, '_id', {
        ...authorizedDataSet,
        authorizeAdd: async (authorize) => {
          const success = await authorize.injector.isAuthorized('user-admin')
          if (!success) {
            const currentUser = await authorize.injector.getCurrentUser()
            await authorize.injector.logger.withScope('common-auth').warning({
              message: `User '${currentUser.username}' tried to create an user without user-admin permissions`,
            })
          }
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
