import { RequestAction, JsonResult, HttpUserContext } from '@furystack/http-api'
import { StoreManager } from '@furystack/core'
import { User } from 'common-service-utils'
import { GithubAuthService } from '../services/github-login-service'
import { GithubAccount } from '../models/github-account'

export const GithubLoginAction: RequestAction = async injector => {
  const { code, clientId } = await injector.getRequest().readPostBody<{ code: string; clientId: string }>()

  try {
    const githubApiPayload = await injector.getInstance(GithubAuthService).getGithubUserData({ code, clientId })
    const existingGhUsers = await injector
      .getInstance(StoreManager)
      .getStoreFor(GithubAccount)
      .search({ filter: { githubId: githubApiPayload.id }, top: 2 })
    if (existingGhUsers.length === 0) {
      return JsonResult({ error: `Github user not registered` }, 500)
    }
    const users = await injector
      .getInstance(StoreManager)
      .getStoreFor(User)
      .search({ filter: { username: existingGhUsers[0].username }, top: 2 })
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
