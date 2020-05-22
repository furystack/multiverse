import { RequestAction, JsonResult } from '@furystack/rest'
import { xpense } from '@common/models'

import { StoreManager } from '@furystack/core'
import { getOrgsForCurrentUser } from '@common/service-utils'

export const GetAvailableAccounts: RequestAction<{
  result: Array<{
    name: string
    ownerType: xpense.Account['ownerType']
    ownerName: xpense.Account['ownerName']
    current: xpense.Account['current']
  }>
}> = async ({ injector }) => {
  const currentUser = await injector.getCurrentUser()
  const orgs = await getOrgsForCurrentUser(injector, currentUser)

  const entries = await injector
    .getInstance(StoreManager)
    .getStoreFor(xpense.Account)
    .find({
      filter: {
        $or: [
          ...orgs.map((org) => ({ ownerType: { $eq: 'organization' as const }, ownerName: { $eq: org.name } })),
          { ownerType: { $eq: 'user' }, ownerName: { $eq: currentUser.username } },
        ],
      },
      select: ['name', 'ownerName', 'ownerType', 'current', 'icon'],
    })
  return JsonResult(entries)
}
