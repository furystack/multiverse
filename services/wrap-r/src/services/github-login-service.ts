/* eslint-disable @typescript-eslint/camelcase */
import { get } from 'https'
import { Injectable, Injector } from '@furystack/inject'
import got from 'got'
import { ScopedLogger } from '@furystack/logging'
import { tokens } from 'sites'

export interface GithubApiPayload {
  login: string
  id: number
  node_id: string
  avatar_url: string
  gravatar_id: string
  url: string
  html_url: string
  followers_url: string
  following_url: string
  gists_url: string
  starred_url: string
  subscriptions_url: string
  organizations_url: string
  repos_url: string
  events_url: string
  received_events_url: string
  type: string
  site_admin: boolean
  name: string
  company: string
  blog: string
  location: string
  email: string
  hireable: boolean
  bio: string
  public_repos: number
  public_gists: number
  followers: number
  following: number
  created_at: string
  updated_at: string
}

@Injectable()
export class GithubAuthService {
  public authUrl = 'https://api.github.com/user'

  public get = get
  public readonly logger: ScopedLogger
  /**
   * Returns the extracted Github Authentication data from the token.
   * @param token
   */
  public async getGithubUserData(options: { code: string; clientId: string }): Promise<GithubApiPayload> {
    const clientSecret = tokens.githubClientSecret
    if (!clientSecret) {
      this.logger.error({
        message: `Github Client secret has not been set up in the GITHUB_CLIENT_SECRET env. variable.`,
      })
      throw Error('Github Authentication failed')
    }
    const body = JSON.stringify({
      code: options.code,
      client_id: options.clientId,
      client_secret: clientSecret,
    })
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
    return JSON.parse(currentUserResponse.body) as GithubApiPayload
  }

  /**
   *
   */
  constructor(injector: Injector) {
    this.logger = injector.logger.withScope('GithubAuthService')
  }
}
