import { get } from 'https'
import { Injectable, Injector } from '@furystack/inject'
// import got from 'got'
import { getLogger, ScopedLogger } from '@furystack/logging'
import { tokens } from '@common/config'
import { auth } from '@common/models'

@Injectable()
export class GithubAuthService {
  public authUrl = 'https://api.github.com/user'

  public get = get
  public readonly logger: ScopedLogger
  /**
   * Returns the extracted Github Authentication data from the token.
   * @param token
   */
  public async getGithubUserData(options: { code: string; clientId: string }): Promise<auth.GithubApiPayload> {
    const clientSecret = tokens.githubClientSecret
    if (!clientSecret) {
      await this.logger.error({
        message: `Github Client secret has not been set up in the GITHUB_CLIENT_SECRET env. variable.`,
        data: {
          sendToSlack: true,
        },
      })
      throw Error('Github Authentication failed')
    }
    const body = JSON.stringify({
      code: options.code,
      client_id: options.clientId,
      client_secret: clientSecret,
    })
    const response = await fetch('https://github.com/login/oauth/access_token', {
      body,
      method: 'POST',
      headers: {
        'Content-type': 'application/json',
        Accept: 'application/json',
      },
    })
    const json = await response.json()
    const accessToken = json.access_token
    const currentUserResponse = await fetch('https://api.github.com/user', {
      headers: {
        Authorization: `token ${accessToken}`,
      },
    })
    return (await currentUserResponse.json()) as auth.GithubApiPayload
  }

  /**
   *
   */
  constructor(injector: Injector) {
    this.logger = getLogger(injector).withScope('GithubAuthService')
  }
}
