import { Injector } from '@furystack/inject'
import { dashboard } from '@common/models'
import { AuthorizeOwnership, getOrgsForCurrentUser } from '@common/service-utils'

export const setupRepository = (injector: Injector) => {
  injector.setupRepository((repo) =>
    repo.createDataSet(dashboard.Dashboard, '_id', {
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
}
