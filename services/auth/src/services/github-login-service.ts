import { Injectable, Injected, Injector } from '@furystack/inject'
import { getLogger } from '@furystack/logging'
import { tokens } from '@common/config'
import { auth } from '@common/models'

@Injectable()
export class GithubAuthService {
  public authUrl = 'https://api.github.com/user'

  /**
   * Returns the extracted Github Authentication data from the token.
   * @param token
   */
  public async getGithubUserData(options: { code: string; clientId: string }): Promise<auth.GithubApiPayload> {
    const clientSecret = tokens.githubClientSecret
    if (!clientSecret) {
      await getLogger(this.injector)
        .withScope(this.constructor.name)
        .error({
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
    const currentUserResponse = await fetch(this.authUrl, {
      headers: {
        Authorization: `token ${accessToken}`,
      },
    })
    return (await currentUserResponse.json()) as auth.GithubApiPayload
  }

  @Injected(Injector)
  private readonly injector!: Injector
}
