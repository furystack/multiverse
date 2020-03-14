import { RequestAction, JsonResult } from '@furystack/rest'
import { HttpUserContext } from '@furystack/rest-service'
import { StoreManager } from '@furystack/core'
import { GithubAccount, User } from 'common-models'
import { GithubAuthService } from '../services/github-login-service'

export const GithubLoginAction: RequestAction<{ body: { code: string; clientId: string } }> = async ({
  injector,
  getBody,
}) => {
  const { code, clientId } = await getBody()

  try {
    const githubApiPayload = await injector.getInstance(GithubAuthService).getGithubUserData({ code, clientId })
    const existingGhUsers = await injector
      .getInstance(StoreManager)
      .getStoreFor(GithubAccount)
      .search({ filter: { githubId: { $eq: githubApiPayload.id } }, top: 2 })
    if (existingGhUsers.length === 0) {
      return JsonResult({ error: `Github user not registered` }, 500)
    }
    const users = await injector
      .getInstance(StoreManager)
      .getStoreFor(User)
      .search({ filter: { username: { $eq: existingGhUsers[0].username } }, top: 2 })
    if (users.length !== 1) {
      return JsonResult({ error: `Found '${users.length}' associated user(s)` }, 500)
    }
    await injector.getInstance(HttpUserContext).cookieLogin(users[0], injector.getResponse())
    delete users[0].password
    return JsonResult({ ...users[0] })
  } catch (error) {
    return JsonResult({ error: error.toString() }, 500)
  }
}
