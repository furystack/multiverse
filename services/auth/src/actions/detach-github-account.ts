import { RequestAction, JsonResult } from '@furystack/rest'
import { StoreManager } from '@furystack/core'
import { GithubAccount, User } from '@common/models'

export const DetachGithubAccount: RequestAction<{ result: User }> = async ({ injector }) => {
  const logger = injector.logger.withScope('DetachGithubAccountAction')

  const currentUser = (await injector.getCurrentUser()) as User
  const ghAccountStore = injector.getInstance(StoreManager).getStoreFor(GithubAccount)
  const [ghAccount] = await ghAccountStore.find({ top: 1, filter: { username: { $eq: currentUser.username } } })

  await ghAccountStore.remove(ghAccount._id)
  logger.information({ message: `User '${currentUser.username}' has detached a github account` })

  return JsonResult(currentUser)
}
