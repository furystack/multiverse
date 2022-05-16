import { RequestError } from '@furystack/rest'
import { xpense } from '@common/models'
import { RequestAction, JsonResult } from '@furystack/rest-service'
import { getCurrentUser } from '@furystack/core'
import { getDataSetFor } from '@furystack/repository'
import { recalculateHistory } from '../services/recalculate-history'

export const PostReplenishment: RequestAction<{
  body: { amount: number; comment?: string; creationDate: string }
  url: { accountId: string }
  result: xpense.Replenishment
}> = async ({ injector, getBody, getUrlParams }) => {
  const currentUser = await getCurrentUser(injector)
  const body = await getBody()
  const { accountId } = getUrlParams()
  const ds = getDataSetFor(injector, xpense.Account, '_id')
  const account = await ds.get(injector, accountId)
  if (!account) {
    throw new RequestError('Account not found!', 404)
  }

  const { created } = await getDataSetFor(injector, xpense.Replenishment, '_id').add(injector, {
    ...body,
    creationDate: new Date(body.creationDate).toISOString(),
    createdBy: currentUser.username,
    accountId,
  })

  await recalculateHistory({ injector, accountId })

  return JsonResult(created[0])
}
