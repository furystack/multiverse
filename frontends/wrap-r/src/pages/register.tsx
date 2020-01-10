import { Shade, createComponent } from '@furystack/shades'
import { Button } from 'common-components/src'
import { GoogleOauthProvider } from '../services/google-auth-provider'

export const RegisterPage = Shade({
  render: ({ injector }) => {
    return (
      <div>
        <h2>Sign up</h2>
        <div>
          <Button
            onclick={() => {
              injector.getInstance(GoogleOauthProvider).signup()
            }}>
            Sign up with Google
          </Button>
        </div>
      </div>
    )
  },
})
