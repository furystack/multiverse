import { RequestAction, JsonResult } from '@furystack/rest'
import { StoreManager } from '@furystack/core'
import { GithubAccount, User } from '@common/models'
import { GithubAuthService } from '../services/github-login-service'

export const AttachGithubAccount: RequestAction<{ body: { code: string; clientId: string }; result: User }> = async ({
  injector,
  getBody,
}) => {
  const logger = injector.logger.withScope('AttachGithubAccountAction')

  const currentUser = (await injector.getCurrentUser()) as User
  const { code, clientId } = await getBody()
  const githubApiPayload = await injector.getInstance(GithubAuthService).getGithubUserData({ code, clientId })
  const ghAccountStore = injector.getInstance(StoreManager).getStoreFor(GithubAccount)
  const registrationDate = new Date().toISOString()

  const githubAccount = await ghAccountStore.add({
    accountLinkDate: registrationDate,
    username: currentUser.username,
    githubId: githubApiPayload.id,
    githubApiPayload,
  } as GithubAccount)

  logger.information({
    message: `Github account '${githubApiPayload.name}' has been attached to user '${currentUser.username}' `,
    data: { user: currentUser, githubAccount },
  })

  return JsonResult(currentUser)
}
