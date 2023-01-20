import type { Injector } from '@furystack/inject'
import { dashboard } from '@common/models'
import { AuthorizeOwnership, getOrgsForCurrentUser } from '@common/service-utils'
import { getRepository } from '@furystack/repository'
import { getCurrentUser } from '@furystack/core'

export const setupRepository = (injector: Injector) => {
  getRepository(injector).createDataSet(dashboard.Dashboard, '_id', {
    authorizeGetEntity: AuthorizeOwnership({
      level: ['member', 'owner', 'admin', 'organizationOwner'],
    }),
    authorizeUpdateEntity: AuthorizeOwnership({
      level: ['owner', 'organizationOwner', 'admin'],
    }),
    modifyOnAdd: async ({ injector: i, entity }) => {
      const currentUser = await getCurrentUser(i)
      return { ...entity, owner: { type: 'user', username: currentUser.username } } as dashboard.Dashboard
    },
    addFilter: async ({ injector: i, filter }) => {
      const currentUser = await getCurrentUser(i)
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
  })
}
