import { Injector, Injectable, Injected } from '@furystack/inject'
import { sleepAsync } from '@furystack/utils'
import { useAuthApi, SessionService } from '@common/frontend-utils'

/**
 * Options for Google OAuth Authentication
 */
export class GoogleAuthenticationOptions {
  /**
   * Defines the Redirect Uri. Will fall back to 'window.location.origin', if not provided
   */
  public redirectUri!: string
  /**
   * Scope settings for Google Oauth
   * Visit the following link to read more about Google Scopes:
   * https://developers.google.com/identity/protocols/googlescopes
   */
  public scope: string[] = ['email', 'profile']

  public windowInstance = window
}
@Injectable()
export class GoogleOauthProvider {
  @Injected(Injector)
  private readonly injector!: Injector

  /**
   * Disposes the OAuth provider
   */
  public dispose() {
    this.iframe = null as any
  }
  /**
   * Logs in the User with Google OAuth. Tries to retrieve the Token, if not provided.
   * @param { string? } token If provided, the sensenet Oauth Login endpoint will be called with this token. Otherwise it will try to get it with GetToken()
   * @returns a Promise that will be resolved after the Login request
   */
  public async login() {
    try {
      this.session.isOperationInProgress.setValue(true)
      const token = await this.getToken()
      const { result: user } = await useAuthApi(this.injector)({
        method: 'POST',
        action: '/googleLogin',
        body: { token },
      })
      if (user) {
        this.session.currentUser.setValue(user)
        this.session.state.setValue('authenticated')
      }
    } finally {
      this.session.isOperationInProgress.setValue(false)
    }
  }

  /**
   * Sign up the current user with Google credentials
   */
  public async signup() {
    try {
      this.session.isOperationInProgress.setValue(true)
      const token = await this.getToken()
      const { result: user } = await useAuthApi(this.injector)({
        method: 'POST',
        action: '/googleRegister',
        body: { token },
      })
      if (user) {
        this.session.currentUser.setValue(user)
        this.session.state.setValue('authenticated')
        window.history.pushState('', '', '/')
      }
    } finally {
      this.session.isOperationInProgress.setValue(false)
    }
  }

  private popup!: Window | null

  /**
   * Gets the Token from a child window.
   * @param {string} loginReqUrl The Login request URL
   * @returns {Promise<string>} A promise that will be resolved with an id_token or rejected in case of any error or interruption
   */
  private async getTokenFromPrompt(loginReqUrl: string): Promise<string> {
    return new Promise<string>((resolve, reject) => {
      this.popup = this.options.windowInstance.open(
        loginReqUrl,
        '_blank',
        'toolbar=no,scrollbars=no,resizable=no,top=200,left=300,width=400,height=400',
      )
      const timer = setInterval(() => {
        if (this.popup && this.popup.window) {
          try {
            if (this.popup.window.location.href !== loginReqUrl) {
              const token = this.getGoogleTokenFromUri(this.popup.window.location)
              if (token) {
                resolve(token)
                this.popup.close()
                clearInterval(timer)
              }
            }
          } catch (error) {
            /** cross-origin */
          }
        } else {
          // Popup closed
          reject(Error('The popup has been closed'))
          clearInterval(timer)
        }
      }, 50)
    })
  }

  private iframe!: HTMLIFrameElement

  /**
   * Tries to retrieve an id_token w/o user interaction
   * @param loginUrl the login Url
   * @returns {Promise<string>} A promise that will be resolved with a token or rejected if cannot get the Token silently.
   */
  private async getTokenSilent(loginUrl: string): Promise<string> {
    if (this.iframe) {
      throw Error('Getting token already in progress')
    }

    const token = await new Promise<string>((resolve, reject) => {
      this.iframe = this.options.windowInstance.document.createElement('iframe')
      this.iframe.style.display = 'none'
      this.iframe.setAttribute('sandbox', 'allow-same-origin allow-scripts')

      this.iframe.onload = async (ev) => {
        await sleepAsync(500)
        const location = ((ev.srcElement as HTMLIFrameElement).contentDocument as Document).location || null

        const iframeToken = location && this.getGoogleTokenFromUri(location)
        iframeToken ? resolve(iframeToken) : reject(Error('Token not found'))
        this.options.windowInstance.document.body.removeChild(this.iframe)
        this.iframe = undefined as any
      }
      this.iframe.src = loginUrl
      this.options.windowInstance.document.body.appendChild(this.iframe)
    })

    return token
  }

  /**
   * Tries to retrieve a valid Google id_token
   * @returns {Promise<string>} A promise that will be resolved with an id_token, or will be rejected in case of errors or if the dialog closes
   */
  public async getToken(): Promise<string> {
    const { result: oauthData } = await useAuthApi(this.injector)({
      method: 'GET',
      action: '/oauth-data',
    })
    const loginReqUrl = this.getGoogleLoginUrl(oauthData.googleClientId)
    try {
      return await this.getTokenSilent(loginReqUrl)
    } catch (error) {
      /** Cannot get token */
    }
    return await this.getTokenFromPrompt(loginReqUrl)
  }

  /**
   * Gets a Google OAuth2 Login window URL based on the provider options
   * @returns {string} the generated Url
   */
  public getGoogleLoginUrl(clientId: string): string {
    return (
      `https://accounts.google.com/o/oauth2/v2/auth` +
      `?response_type=id_token` +
      `&redirect_uri=${encodeURIComponent(this.options.redirectUri)}` +
      `&scope=${encodeURIComponent(this.options.scope.join(' '))}` +
      `&client_id=${encodeURIComponent(clientId)}` +
      `&nonce=${Math.random().toString()}`
    )
  }

  /**
   * Extracts an id_token from a provided Location
   * @param { Location } uri The Location uri with the hashed id_token to be extracted
   * @returns { string | null } The extracted id_token
   */
  public getGoogleTokenFromUri(uri: Location): string | null {
    const tokenSegmentPrefix = '#id_token='
    const tokenSegment = uri.hash.split('&').find((segment) => segment.indexOf(tokenSegmentPrefix) === 0)
    if (tokenSegment) {
      return tokenSegment.replace(tokenSegmentPrefix, '')
    }
    return null
  }

  @Injected(SessionService)
  private readonly session!: SessionService

  @Injected(GoogleAuthenticationOptions)
  private readonly options!: GoogleAuthenticationOptions
}

export const useGoogleAuth = function (injector: Injector, options?: GoogleAuthenticationOptions) {
  const newOptions = new GoogleAuthenticationOptions()
  Object.assign(newOptions, options)

  if (!newOptions.redirectUri) {
    newOptions.redirectUri = `${window.location.origin}/`
  }
  injector.setExplicitInstance(newOptions, GoogleAuthenticationOptions)
}
