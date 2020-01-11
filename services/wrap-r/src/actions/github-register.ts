/* eslint-disable @typescript-eslint/camelcase */
import { RequestAction, JsonResult, HttpUserContext } from '@furystack/http-api'
import got from 'got'
import { StoreManager } from '@furystack/core'
import { User } from 'common-service-utils'
import { GithubAccount } from '../models/github-account'
import { GithubApiPayload } from '../services/github-login-service'

export const GithubRegisterAction: RequestAction = async injector => {
  const { code, clientId } = await injector.getRequest().readPostBody<{ code: string; clientId: string }>()
  const clientSecret = process.env.GITHUB_CLIENT_SECRET

  const body = JSON.stringify({
    code,
    client_id: clientId,
    client_secret: clientSecret,
  })
  try {
    const registrationDate = new Date().toISOString()
    const response = await got.post<string>({
      href: 'https://github.com/login/oauth/access_token',
      body,
      headers: {
        'Content-type': 'application/json',
        Accept: 'application/json',
      },
    })
    const accessToken = JSON.parse(response.body).access_token
    const currentUserResponse = await got.get({
      href: 'https://api.github.com/user',
      headers: {
        Authorization: `token ${accessToken}`,
      },
    })
    const githubApiPayload = JSON.parse(currentUserResponse.body) as GithubApiPayload

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
      .add(({
        password: '',
        roles: ['terms-accepted'],
        username: githubApiPayload.email || `${githubApiPayload.login}@github.com`,
        registrationDate,
      } as unknown) as User)

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
