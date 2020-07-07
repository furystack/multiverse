import '@furystack/auth-google'
import '@furystack/repository/dist/injector-extension'
import { VerboseConsoleLogger } from '@furystack/logging'
import { Injector } from '@furystack/inject'
import { dashboard } from '@common/models'
import { AuthorizeOwnership, getOrgsForCurrentUser } from '@common/service-utils'
import { databases } from '@common/config'

export const injector = new Injector()

injector.useDbLogger({ appName: 'dashboard' }).useCommonHttpAuth().useLogging(VerboseConsoleLogger)

injector.setupStores((sm) =>
  sm.useMongoDb({
    primaryKey: '_id',
    model: dashboard.Dashboard,
    url: databases.dashboard.mongoUrl,
    db: databases.dashboard.dbName,
    collection: databases.dashboard.dashboards,
    options: databases.standardOptions,
  }),
)

injector.setupRepository((repo) =>
  repo.createDataSet(dashboard.Dashboard, {
    authorizeGetEntity: AuthorizeOwnership({
      level: ['member', 'owner', 'admin', 'organizationOwner'],
    }),
    authorizeUpdateEntity: AuthorizeOwnership({
      level: ['owner', 'organizationOwner', 'admin'],
    }),
    addFilter: async ({ injector: i, filter }) => {
      const currentUser = await i.getCurrentUser()
      const orgs = await getOrgsForCurrentUser(i, currentUser)
      return {
        ...filter,
        filter: {
          $and: [
            ...(filter.filter ? [filter.filter] : []),
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
  }),
)
