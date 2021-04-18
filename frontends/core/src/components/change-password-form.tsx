import { Shade, createComponent } from '@furystack/shades'
import { Input, Button, NotyService } from '@furystack/shades-common-components'
import { AuthApiService } from '@common/frontend-utils'

export const ChangePasswordForm = Shade<
  { style?: Partial<CSSStyleDeclaration>; showCurrentPassword?: boolean; onUpdated?: () => void },
  { currentPassword: string; newPassword: string; confirmNewPassword: string }
>({
  shadowDomName: 'shade-change-password-form',
  getInitialState: () => ({ currentPassword: '', newPassword: '', confirmNewPassword: '' }),
  render: ({ props, updateState, getState, injector }) => {
    return (
      <form
        style={props.style}
        onsubmit={async (ev) => {
          ev.preventDefault()
          const { currentPassword, newPassword, confirmNewPassword } = getState()
          if (newPassword !== confirmNewPassword) {
            injector.getInstance(NotyService).addNoty({
              type: 'warning',
              title: 'Cannot update password',
              body: 'The password and the password confirmation should be the same',
            })
            return
          }
          try {
            const { result } = await injector.getInstance(AuthApiService).call({
              method: 'POST',
              action: '/changePassword',
              body: {
                newPassword,
                currentPassword,
              },
            })
            if (result.success) {
              injector.getInstance(NotyService).addNoty({
                type: 'success',
                title: 'Success',
                body: 'Your password has been changed.',
              })
              updateState({ confirmNewPassword: '', currentPassword: '', newPassword: '' }, true)
              props.onUpdated && props.onUpdated()
              return
            }
          } catch (error) {
            const responseJson = await error.response.json()
            injector.getInstance(NotyService).addNoty({
              type: 'error',
              title: 'Failed to update password',
              body: responseJson?.message || error.message || error.toString(),
            })
          }
        }}>
        {props.showCurrentPassword ? (
          <Input
            labelTitle="Current password"
            type="password"
            required
            name="currentPassword"
            onchange={(ev) => updateState({ currentPassword: (ev.target as HTMLInputElement).value }, true)}
          />
        ) : null}
        <Input
          labelTitle="New password"
          type="password"
          name="newPassword"
          required
          onchange={(ev) => updateState({ newPassword: (ev.target as HTMLInputElement).value }, true)}
        />
        <Input
          labelTitle="Confirm new password"
          type="password"
          name="confirmNewPassword"
          required
          onchange={(ev) => updateState({ confirmNewPassword: (ev.target as HTMLInputElement).value }, true)}
        />
        <Button color="primary" variant="contained" type="submit">
          Change password
        </Button>
      </form>
    )
  },
})
