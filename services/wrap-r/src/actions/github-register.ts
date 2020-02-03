/* eslint-disable @typescript-eslint/camelcase */
import { RequestAction, JsonResult, HttpUserContext } from '@furystack/http-api'
import { StoreManager } from '@furystack/core'
import { User } from 'common-service-utils'
import { GithubAuthService } from '../services/github-login-service'
import { GithubAccount } from '../models/github-account'

export const GithubRegisterAction: RequestAction = async injector => {
  const { code, clientId } = await injector.getRequest().readPostBody<{ code: string; clientId: string }>()

  try {
    const registrationDate = new Date().toISOString()
    const githubApiPayload = await injector.getInstance(GithubAuthService).getGithubUserData({ code, clientId })

    const existingGhUsers = await injector
      .getInstance(StoreManager)
      .getStoreFor(GithubAccount)
      .search({ filter: { githubId: githubApiPayload.id }, top: 2 })
    if (existingGhUsers.length !== 0) {
      return JsonResult({ error: `Github user already registered` }, 500)
    }
    const newUser = await injector
      .getInstance(StoreManager)
      .getStoreFor(User)
      .add({
        password: '',
        roles: ['terms-accepted'],
        username: githubApiPayload.email || `${githubApiPayload.login}@github.com`,
        registrationDate,
        avatarUrl: githubApiPayload.avatar_url || undefined,
      } as User)

    await injector
      .getInstance(StoreManager)
      .getStoreFor(GithubAccount)
      .add({
        accountLinkDate: registrationDate,
        username: newUser.username,
        githubId: githubApiPayload.id,
        githubApiPayload,
      } as GithubAccount)

    await injector.getInstance(HttpUserContext).cookieLogin(newUser, injector.getResponse())
    delete newUser.password
    return JsonResult({ ...newUser })
  } catch (error) {
    return JsonResult({ error: error.toString() }, 500)
  }
}
