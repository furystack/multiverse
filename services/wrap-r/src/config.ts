import '@furystack/auth-google'
import { verifyAndCreateIndexes } from 'common-service-utils'
import { DataSetSettings } from '@furystack/repository'
import '@furystack/repository/dist/injector-extension'
import { HttpUserContext } from '@furystack/rest-service'
import { ConsoleLogger } from '@furystack/logging'
import { Injector } from '@furystack/inject'
import { User, LogEntry, GoogleAccount, GithubAccount, Organization } from 'common-models'
import { databases } from 'common-config'

export const authorizedOnly = async (options: { injector: Injector }) => {
  const authorized = await options.injector.getInstance(HttpUserContext).isAuthenticated()
  return {
    isAllowed: authorized,
    message: 'You are not authorized :(',
  }
}

export const authorizedDataSet: Partial<DataSetSettings<any>> = {
  authorizeAdd: authorizedOnly,
  authorizeGet: authorizedOnly,
  authorizeRemove: authorizedOnly,
  authorizeUpdate: authorizedOnly,
  authroizeRemoveEntity: authorizedOnly,
}

export const injector = new Injector()

injector
  .useDbLogger({ appName: 'wrap-r' })
  .useCommonHttpAuth()
  .setupStores((sm) =>
    sm
      .useMongoDb({
        model: GoogleAccount,
        url: databases['common-auth'].mongoUrl,
        db: databases['common-auth'].dbName,
        collection: 'google-accounts',
        options: {
          useUnifiedTopology: true,
        },
      })
      .useMongoDb({
        model: GithubAccount,
        url: databases['common-auth'].mongoUrl,
        db: databases['common-auth'].dbName,
        collection: 'github-accounts',
        options: {
          useUnifiedTopology: true,
        },
      })
      .useMongoDb({
        model: Organization,
        url: databases['common-auth'].mongoUrl,
        db: databases['common-auth'].dbName,
        collection: 'organizations',
        options: {
          useUnifiedTopology: true,
        },
      }),
  )
  .useLogging(ConsoleLogger)
  .setupRepository((repo) =>
    repo
      .createDataSet(User, {
        ...authorizedDataSet,
        authorizeAdd: async (authorize) => {
          const success = await authorize.injector.getInstance(HttpUserContext).isAuthorized('user-admin')
          return {
            isAllowed: success ? true : false,
            message: success ? '' : "Role 'user-admin' required.",
          }
        },
        name: 'users',
      })
      .createDataSet(LogEntry, {
        name: 'logEntries',
        authorizeAdd: async () => ({ isAllowed: false, message: 'The DataSet is read only' }),
        authorizeRemove: async () => ({ isAllowed: false, message: 'The DataSet is read only' }),
        authorizeUpdate: async () => ({ isAllowed: false, message: 'The DataSet is read only' }),
        authorizeGet: async (options) => {
          const result = await options.injector.getInstance(HttpUserContext).isAuthorized('sys-logs')
          return {
            isAllowed: result,
            message: result ? '' : "Role 'sys-logs' required",
          }
        },
      })
      .createDataSet(Organization, {
        name: 'organizations',
        authorizeUpdateEntity: async ({ injector: i, entity }) => {
          const currentUser = await i.getInstance(HttpUserContext).getCurrentUser()
          if (entity.ownerName === currentUser.username || entity.adminNames.includes(currentUser.username)) {
            return { isAllowed: true }
          }
          return { isAllowed: false, message: 'Only the owner or admins can modify an organization' }
        },
      }),
  )

verifyAndCreateIndexes({
  injector,
  model: GoogleAccount,
  indexName: 'googleId',
  indexSpecification: { googleId: 1 },
  indexOptions: { unique: true },
})
verifyAndCreateIndexes({
  injector,
  model: GithubAccount,
  indexName: 'githubId',
  indexSpecification: { githubId: 1 },
  indexOptions: { unique: true },
})

verifyAndCreateIndexes({
  injector,
  model: Organization,
  indexName: 'orgName',
  indexSpecification: { name: 1 },
  indexOptions: { unique: true },
})
