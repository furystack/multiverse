import { RequestError } from '@furystack/rest'
import type { RequestAction } from '@furystack/rest-service'
import { HttpUserContext, JsonResult } from '@furystack/rest-service'
import { StoreManager } from '@furystack/core'
import { auth } from '@common/models'
import { getLogger } from '@furystack/logging'
import { GithubAuthService } from '../services/github-login-service'

export const GithubLoginAction: RequestAction<{
  body: { code: string; clientId: string }
  result: Omit<auth.User, 'password'>
}> = async ({ injector, getBody, response }) => {
  const { code, clientId } = await getBody()
  let githubApiPayload!: auth.GithubApiPayload
  try {
    githubApiPayload = await injector.getInstance(GithubAuthService).getGithubUserData({ code, clientId })
  } catch (error) {
    await getLogger(injector).error({
      scope: 'GithubLoginAction',
      message: 'Github Login error',
      data: { error },
    })
    throw new RequestError('Cannot get payload from Github', 500)
  }
  const existingGhUsers = await injector
    .getInstance(StoreManager)
    .getStoreFor(auth.GithubAccount, '_id')
    .find({ filter: { githubId: { $eq: githubApiPayload.id } }, top: 2 })
  if (existingGhUsers.length === 0) {
    throw new RequestError(`Github user not registered`, 500)
  }
  const users = await injector
    .getInstance(StoreManager)
    .getStoreFor(auth.User, '_id')
    .find({ filter: { username: { $eq: existingGhUsers[0].username } }, top: 2 })
  if (users.length !== 1) {
    throw new RequestError(`Found '${users.length}' associated user(s)`, 500)
  }
  await injector.getInstance(HttpUserContext).cookieLogin(users[0], response)
  const user = users[0]
  return JsonResult({ ...user })
}
