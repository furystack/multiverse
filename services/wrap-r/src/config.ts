import '@furystack/auth-google'
import { verifyAndCreateIndexes } from 'common-service-utils'
import { DataSetSettings } from '@furystack/repository'
import { EdmType } from '@furystack/odata'
import { LoginAction, LogoutAction, GetCurrentUser, HttpUserContext, IsAuthenticated } from '@furystack/http-api'
import { VerboseConsoleLogger } from '@furystack/logging'
import { Injector } from '@furystack/inject'
import { User, LogEntry } from 'common-models'
import { GoogleLoginAction } from './actions/google-login'
import { GoogleRegisterAction } from './actions/google-register'
import { GithubLoginAction } from './actions/github-login'
import { GoogleAccount } from './models'
import { GithubAccount } from './models/github-account'
import { GithubRegisterAction } from './actions/github-register'
import { RegisterAction } from './actions/register'

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
  .useOdata('/', odata =>
    odata.addNameSpace('default', ns => {
      ns.setupEntities(entities =>
        entities
          .addEntityType({
            model: User,
            primaryKey: 'username',
            properties: [{ property: 'username', type: EdmType.String, nullable: false }],
            name: 'User',
          })
          .addEntityType({
            model: LogEntry,
            primaryKey: '_id',
            properties: [
              { property: '_id', type: EdmType.Guid, nullable: false },
              { property: 'creationDate', type: EdmType.DateTime, nullable: false },
              { property: 'message', type: EdmType.String, nullable: false },
              { property: 'scope', type: EdmType.String, nullable: false },
              { property: 'level', type: EdmType.Int16, nullable: false },
              { property: 'data', type: EdmType.Unknown, nullable: true },
            ],
            name: 'LogEntry',
          }),
      ).setupCollections(collections =>
        collections
          .addCollection({
            model: User,
            name: 'users',
            functions: [
              {
                action: GetCurrentUser,
                name: 'current',
                returnType: User,
              },
              {
                action: IsAuthenticated,
                name: 'isAuthenticated',
                returnType: Object,
              },
            ],
            actions: [
              {
                action: LoginAction,
                name: 'login',
                parameters: [
                  { name: 'username', type: EdmType.String, nullable: false },
                  { name: 'password', type: EdmType.String, nullable: false },
                ],
                returnType: User,
              },
              {
                action: GoogleLoginAction,
                name: 'googleLogin',
                parameters: [
                  {
                    name: 'token',
                    type: EdmType.String,
                    nullable: false,
                  },
                ],
              },
              {
                action: GithubLoginAction,
                name: 'githubLogin',
                parameters: [
                  {
                    name: 'code',
                    type: EdmType.String,
                    nullable: false,
                  },
                  {
                    name: 'clientId',
                    type: EdmType.String,
                    nullable: false,
                  },
                ],
              },
              {
                action: GoogleRegisterAction,
                name: 'googleRegister',
                parameters: [
                  {
                    name: 'token',
                    type: EdmType.String,
                    nullable: false,
                  },
                ],
              },
              {
                action: GithubRegisterAction,
                name: 'githubRegister',
                parameters: [
                  {
                    name: 'code',
                    type: EdmType.String,
                    nullable: false,
                  },
                  {
                    name: 'clientId',
                    type: EdmType.String,
                    nullable: false,
                  },
                ],
              },
              {
                action: RegisterAction,
                name: 'register',
                parameters: [
                  {
                    name: 'email',
                    type: EdmType.String,
                    nullable: false,
                  },
                  {
                    name: 'password',
                    type: EdmType.String,
                    nullable: false,
                  },
                ],
              },
              { action: LogoutAction, name: 'logout' },
            ],
          })
          .addCollection({
            model: LogEntry,
            name: 'logEntries',
          }),
      )
      return ns
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
