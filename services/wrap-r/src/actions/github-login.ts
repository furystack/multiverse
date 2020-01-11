/* eslint-disable @typescript-eslint/camelcase */
import { RequestAction, JsonResult, HttpUserContext } from '@furystack/http-api'
import got from 'got'
import { StoreManager } from '@furystack/core'
import { User } from 'common-service-utils'
import { GithubAccount } from '../models/github-account'
import { GithubApiPayload } from '../services/github-login-service'

export const GithubLoginAction: RequestAction = async injector => {
  const { code, clientId } = await injector.getRequest().readPostBody<{ code: string; clientId: string }>()
  const clientSecret = process.env.GITHUB_CLIENT_SECRET

  const body = JSON.stringify({
    code,
    client_id: clientId,
    client_secret: clientSecret,
  })
  try {
    const response = await got.post({
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
    injector.getInstance(HttpUserContext).cookieLogin(users[0], injector.getResponse())
    delete users[0].password
    return JsonResult({ ...users[0] })
  } catch (error) {
    return JsonResult({ error: error.toString() }, 500)
  }
}
