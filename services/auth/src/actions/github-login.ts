import { RequestAction, JsonResult, RequestError } from '@furystack/rest'
import { HttpUserContext } from '@furystack/rest-service'
import { StoreManager } from '@furystack/core'
import { GithubAccount, User } from '@common/models'
import { GithubAuthService } from '../services/github-login-service'

export const GithubLoginAction: RequestAction<{ body: { code: string; clientId: string }; result: User }> = async ({
  injector,
  getBody,
  response,
}) => {
  const { code, clientId } = await getBody()
  const githubApiPayload = await injector.getInstance(GithubAuthService).getGithubUserData({ code, clientId })
  const existingGhUsers = await injector
    .getInstance(StoreManager)
    .getStoreFor(GithubAccount)
    .search({ filter: { githubId: { $eq: githubApiPayload.id } }, top: 2 })
  if (existingGhUsers.length === 0) {
    throw new RequestError(`Github user not registered`, 500)
  }
  const users = await injector
    .getInstance(StoreManager)
    .getStoreFor(User)
    .search({ filter: { username: { $eq: existingGhUsers[0].username } }, top: 2 })
  if (users.length !== 1) {
    throw new RequestError(`Found '${users.length}' associated user(s)`, 500)
  }
  await injector.getInstance(HttpUserContext).cookieLogin(users[0], response)
  delete users[0].password
  return JsonResult({ ...users[0] })
}
