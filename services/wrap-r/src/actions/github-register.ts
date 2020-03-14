/* eslint-disable @typescript-eslint/camelcase */
import { RequestAction, JsonResult } from '@furystack/rest'
import { StoreManager } from '@furystack/core'
import { User, GithubAccount } from 'common-models'
import { HttpUserContext } from '@furystack/rest-service'
import { GithubAuthService } from '../services/github-login-service'

export const GithubRegisterAction: RequestAction<{ body: { code: string; clientId: string } }> = async ({
  injector,
  getBody,
}) => {
  const { code, clientId } = await getBody()

  try {
    const registrationDate = new Date().toISOString()
    const githubApiPayload = await injector.getInstance(GithubAuthService).getGithubUserData({ code, clientId })

    const existingGhUsers = await injector
      .getInstance(StoreManager)
      .getStoreFor(GithubAccount)
      .search({ filter: { githubId: { $eq: githubApiPayload.id } }, top: 2 })
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
