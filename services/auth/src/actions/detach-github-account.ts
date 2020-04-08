import { RequestAction, JsonResult } from '@furystack/rest'
import { HttpUserContext } from '@furystack/rest-service'
import { StoreManager } from '@furystack/core'
import { GithubAccount, User } from '@common/models'

export const DetachGithubAccount: RequestAction<{ result: User }> = async ({ injector }) => {
  const logger = injector.logger.withScope('DetachGithubAccountAction')

  const currentUser = (await injector.getInstance(HttpUserContext).getCurrentUser()) as User
  const ghAccountStore = injector.getInstance(StoreManager).getStoreFor(GithubAccount)
  const [ghAccount] = await ghAccountStore.search({ top: 1, filter: { username: currentUser.username } })

  await ghAccountStore.remove(ghAccount._id)
  logger.information({ message: `User '${currentUser.username}' has detached a github account` })

  return JsonResult(currentUser)
}
