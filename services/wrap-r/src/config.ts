import '@furystack/auth-google'
import { verifyAndCreateIndexes } from 'common-service-utils'
import { DataSetSettings } from '@furystack/repository'
import '@furystack/repository/dist/injector-extension'
import { HttpUserContext } from '@furystack/rest-service'
import { VerboseConsoleLogger } from '@furystack/logging'
import { Injector } from '@furystack/inject'
import { User, LogEntry, GoogleAccount, GithubAccount } from 'common-models'

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
  .useDbLogger()
  .useCommonHttpAuth()
  .setupStores(sm =>
    sm
      .useMongoDb({
        model: GoogleAccount,
        url: 'mongodb://localhost:27017',
        db: 'multiverse-common-auth',
        collection: 'google-accounts',
        options: {
          useUnifiedTopology: true,
        },
      })
      .useMongoDb({
        model: GithubAccount,
        url: 'mongodb://localhost:27017',
        db: 'multiverse-common-auth',
        collection: 'github-accounts',
        options: {
          useUnifiedTopology: true,
        },
      }),
  )
  .useLogging(VerboseConsoleLogger)
  .setupRepository(repo =>
    repo
      .createDataSet(User, {
        ...authorizedDataSet,
        authorizeAdd: async authorize => {
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
        authorizeGet: async options => {
          const result = await options.injector.getInstance(HttpUserContext).isAuthorized('sys-logs')
          return {
            isAllowed: result,
            message: result ? '' : "Role 'sys-logs' required",
          }
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
