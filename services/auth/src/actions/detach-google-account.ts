import { RequestAction, JsonResult } from '@furystack/rest'
import { StoreManager } from '@furystack/core'
import { auth } from '@common/models'

export const DetachGoogleAccount: RequestAction<{ result: Omit<auth.User, 'password'> }> = async ({ injector }) => {
  const logger = injector.logger.withScope('DetachGithubAccountAction')

  const { password, ...currentUser } = (await injector.getCurrentUser()) as auth.User
  const googleAccountStore = injector.getInstance(StoreManager).getStoreFor(auth.GoogleAccount)
  const [googleAccount] = await googleAccountStore.find({ top: 1, filter: { username: { $eq: currentUser.username } } })

  await googleAccountStore.remove(googleAccount._id)
  logger.information({ message: `User '${currentUser.username}' has detached a google account` })

  return JsonResult(currentUser)
}
