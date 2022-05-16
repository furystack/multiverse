import { getCurrentUser, StoreManager } from '@furystack/core'
import { auth } from '@common/models'
import { RequestAction, JsonResult } from '@furystack/rest-service'
import { getLogger } from '@furystack/logging'
import { GithubAuthService } from '../services/github-login-service'

export const AttachGithubAccount: RequestAction<{
  body: { code: string; clientId: string }
  result: Omit<auth.User, 'password'>
}> = async ({ injector, getBody }) => {
  const logger = getLogger(injector).withScope('AttachGithubAccountAction')

  const currentUser = (await getCurrentUser(injector)) as auth.User
  const { code, clientId } = await getBody()
  const githubApiPayload = await injector.getInstance(GithubAuthService).getGithubUserData({ code, clientId })
  const ghAccountStore = injector.getInstance(StoreManager).getStoreFor(auth.GithubAccount, '_id')
  const registrationDate = new Date().toISOString()

  const { created } = await ghAccountStore.add({
    accountLinkDate: registrationDate,
    username: currentUser.username,
    githubId: githubApiPayload.id,
    githubApiPayload,
  })

  await logger.information({
    message: `Github account '${githubApiPayload.name}' has been attached to user '${currentUser.username}' `,
    data: { user: currentUser, githubAccount: created[0] },
  })

  return JsonResult(currentUser)
}
