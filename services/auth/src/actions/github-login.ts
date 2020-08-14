import { RequestAction, JsonResult, RequestError } from '@furystack/rest'
import { HttpUserContext } from '@furystack/rest-service'
import { StoreManager } from '@furystack/core'
import { auth } from '@common/models'
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
    throw new RequestError('Cannot get payload from Github', 500)
  }
  const existingGhUsers = await injector
    .getInstance(StoreManager)
    .getStoreFor(auth.GithubAccount)
    .find({ filter: { githubId: { $eq: githubApiPayload.id } }, top: 2 })
  if (existingGhUsers.length === 0) {
    throw new RequestError(`Github user not registered`, 500)
  }
  const users = await injector
    .getInstance(StoreManager)
    .getStoreFor(auth.User)
    .find({ filter: { username: { $eq: existingGhUsers[0].username } }, top: 2 })
  if (users.length !== 1) {
    throw new RequestError(`Found '${users.length}' associated user(s)`, 500)
  }
  await injector.getInstance(HttpUserContext).cookieLogin(users[0], response)
  const { password, ...user } = users[0]
  return JsonResult({ ...user })
}
