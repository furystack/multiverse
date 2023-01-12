import { getCurrentUser, StoreManager } from '@furystack/core'
import { auth } from '@common/models'
import type { RequestAction } from '@furystack/rest-service'
import { JsonResult } from '@furystack/rest-service'
import { getLogger } from '@furystack/logging'

export const DetachGoogleAccount: RequestAction<{ result: Omit<auth.User, 'password'> }> = async ({ injector }) => {
  const logger = getLogger(injector).withScope('DetachGithubAccountAction')

  const currentUser = (await getCurrentUser(injector)) as auth.User
  const googleAccountStore = injector.getInstance(StoreManager).getStoreFor(auth.GoogleAccount, '_id')
  const [googleAccount] = await googleAccountStore.find({ top: 1, filter: { username: { $eq: currentUser.username } } })

  await googleAccountStore.remove(googleAccount._id)
  await logger.information({ message: `User '${currentUser.username}' has detached a google account` })

  return JsonResult(currentUser)
}
