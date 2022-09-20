import { useMongoDb } from '@furystack/mongodb-store'
import { Injector } from '@furystack/inject'
import { usePasswordPolicy, PasswordCredential } from '@furystack/security'
import { databases } from '@common/config'
import { auth } from '@common/models'
import { useHttpAuthentication } from '@furystack/rest-service'
import { getRepository } from '@furystack/repository'
import { getCurrentUser, isAuthorized } from '@furystack/core'
import { getLogger } from '@furystack/logging'
import { verifyAndCreateIndexes } from './create-indexes'
import { authorizedDataSet } from './authorized-data-set'

export const useCommonHttpAuth = function (injector: Injector) {
  useMongoDb({
    injector,
    model: auth.User,
    primaryKey: '_id',
    url: databases['common-auth'].mongoUrl,
    db: databases['common-auth'].dbName,
    collection: databases['common-auth'].usersCollection,
  })
  useMongoDb({
    injector,
    primaryKey: '_id',
    model: auth.Organization,
    url: databases['common-auth'].mongoUrl,
    db: databases['common-auth'].dbName,
    collection: 'organizations',
  })
  useMongoDb({
    injector,
    primaryKey: '_id',
    model: auth.Session,
    url: databases['common-auth'].sessionStoreUrl,
    db: databases['common-auth'].dbName,
    collection: 'sessions',
  })
  useMongoDb({
    injector,
    primaryKey: 'userName',
    model: PasswordCredential,
    url: databases['common-auth'].sessionStoreUrl,
    db: databases['common-auth'].dbName,
    collection: 'passwordCredentials',
  })

  useHttpAuthentication(injector, {
    enableBasicAuth: false,
    cookieName: 'fsmvsc',
    model: auth.User,
    getUserStore: (sm) => sm.getStoreFor(auth.User, '_id'),
    getSessionStore: (sm) => sm.getStoreFor(auth.Session, '_id'),
  })
  usePasswordPolicy(injector)

  getRepository(injector)
    .createDataSet(auth.Organization, '_id', {
      authorizeUpdateEntity: async ({ injector: i, entity }) => {
        const currentUser = await getCurrentUser(i)
        if (
          (entity.owner.type === 'user' && entity.owner.username === currentUser.username) ||
          entity.adminNames.includes(currentUser.username)
        ) {
          return { isAllowed: true }
        }
        await getLogger(i)
          .withScope('common-auth')
          .warning({
            message: `User '${currentUser.username}' tried to modify organization '${entity.name}' without owning it or beign an admin`,
          })
        return { isAllowed: false, message: 'Only the owner or admins can modify an organization' }
      },
    })
    .createDataSet(auth.User, '_id', {
      ...authorizedDataSet,
      authorizeAdd: async (authorize) => {
        const success = await isAuthorized(authorize.injector, 'user-admin')
        if (!success) {
          const currentUser = await getCurrentUser(authorize.injector)
          await getLogger(authorize.injector)
            .withScope('common-auth')
            .warning({
              message: `User '${currentUser.username}' tried to create an user without user-admin permissions`,
            })
        }
        return {
          isAllowed: success ? true : false,
          message: success ? '' : "Role 'user-admin' required.",
        }
      },
    })

  verifyAndCreateIndexes({
    injector,
    model: auth.User,
    indexSpecification: { username: 1 },
    indexName: 'username',
    indexOptions: { unique: true },
  })
}
