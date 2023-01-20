import { getCurrentUser, StoreManager } from '@furystack/core'
import { auth } from '@common/models'
import type { RequestAction } from '@furystack/rest-service'
import { JsonResult } from '@furystack/rest-service'
import { getLogger } from '@furystack/logging'

export const DetachGithubAccount: RequestAction<{ result: Omit<auth.User, 'password'> }> = async ({ injector }) => {
  const logger = getLogger(injector).withScope('DetachGithubAccountAction')

  const currentUser = (await getCurrentUser(injector)) as auth.User
  const ghAccountStore = injector.getInstance(StoreManager).getStoreFor(auth.GithubAccount, '_id')
  const [ghAccount] = await ghAccountStore.find({ top: 1, filter: { username: { $eq: currentUser.username } } })

  await ghAccountStore.remove(ghAccount._id)
  await logger.information({ message: `User '${currentUser.username}' has detached a github account` })

  return JsonResult(currentUser)
}
