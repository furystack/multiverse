import { RequestAction, JsonResult } from '@furystack/rest'
import { xpense } from 'common-models'

import { StoreManager } from '@furystack/core'
import { getOrgsForCurrentUser } from 'common-service-utils'
import { HttpUserContext } from '@furystack/rest-service'

export const GetAvailableAccounts: RequestAction<{
  result: Array<{
    name: string
    ownerType: xpense.Account['ownerType']
    ownerName: xpense.Account['ownerName']
    current: xpense.Account['current']
  }>
}> = async ({ injector }) => {
  const currentUser = await injector.getInstance(HttpUserContext).getCurrentUser()
  const orgs = await getOrgsForCurrentUser(injector, currentUser)

  const entries = await injector
    .getInstance(StoreManager)
    .getStoreFor(xpense.Account)
    .search({
      filter: {
        $or: [
          ...orgs.map((org) => ({ ownerType: 'organization', ownerName: org.name })),
          { ownerType: 'user', ownerName: currentUser.username },
        ],
      },
      select: ['name', 'ownerName', 'ownerType', 'current', 'icon'],
    })
  return JsonResult(entries)
}
