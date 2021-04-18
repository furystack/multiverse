import { Injector } from '@furystack/inject'
import { xpense } from '@common/models'
import { getOrgsForCurrentUser, AuthorizeOwnership } from '@common/service-utils'

export const setupRepository = (injector: Injector) => {
  injector.setupRepository((repo) =>
    repo
      .createDataSet(xpense.Account, '_id', {
        addFilter: async ({ injector: i, filter }) => {
          const currentUser = await i.getCurrentUser()
          const orgs = await getOrgsForCurrentUser(i, currentUser)
          return {
            ...filter,
            filter: {
              $and: [
                filter.filter,
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
        modifyOnAdd: async ({ injector: i, entity }) => {
          const currentUser = await i.getCurrentUser()
          return {
            ...entity,
            createdBy: currentUser.username,
            creationDate: new Date().toISOString(),
          }
        },
        authorizeAdd: async ({ injector: i, entity }) => {
          const currentUser = await i.getCurrentUser()
          if (entity.owner?.type === 'user' && entity.owner?.username === currentUser.username) {
            return {
              isAllowed: true,
            }
          }
          if (entity.owner?.type === 'organization') {
            const orgs = await getOrgsForCurrentUser(i, currentUser)
            if (
              orgs.some(
                (org) =>
                  (entity.owner?.type === 'organization' && org.name === entity.owner?.organizationName) ||
                  !org.adminNames.includes(currentUser.username),
              )
            ) {
              return {
                isAllowed: true,
              }
            }
          }

          return {
            isAllowed: false,
            message: 'You can add user accounts only for yourself and organization accounts only if you are an admin',
          }
        },
        authorizeGetEntity: AuthorizeOwnership({ level: ['admin', 'member', 'owner', 'organizationOwner'] }),
      })
      .createDataSet(xpense.Item, '_id', {})
      .createDataSet(xpense.Replenishment, '_id', {
        authorizeGetEntity: async ({ entity, injector: i }) => {
          await injector.getDataSetFor(xpense.Account, '_id').get(i, entity.accountId)
          return { isAllowed: true }
        },
        authorizeRemove: async () => ({ isAllowed: false, message: 'Replenishments are permanent.' }),
        authorizeUpdate: async () => ({ isAllowed: false, message: 'Replenishments are read-only.' }),
      })
      .createDataSet(xpense.Shop, '_id', {})
      .createDataSet(xpense.Shopping, '_id', {
        authorizeGetEntity: async ({ entity, injector: i }) => {
          await injector.getDataSetFor(xpense.Account, '_id').get(i, entity.accountId)
          return { isAllowed: true }
        },
        authorizeRemove: async () => ({ isAllowed: false, message: 'Shoppings are permanent.' }),
        authorizeUpdate: async () => ({ isAllowed: false, message: 'Shoppings are read-only.' }),
      }),
  )
}
