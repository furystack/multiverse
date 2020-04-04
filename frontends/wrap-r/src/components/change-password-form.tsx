import { Shade, createComponent, PartialElement } from '@furystack/shades'
import { Input, Button } from 'common-components'
import { WrapRApiService } from 'common-frontend-utils/src'

export const ChangePasswordForm = Shade<
  { style?: PartialElement<CSSStyleDeclaration>; showCurrentPassword?: boolean; onUpdated?: () => void },
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
            alert('Password and confirm password is not the same!')
            return
          }
          try {
            const result = await injector.getInstance(WrapRApiService).call({
              method: 'POST',
              action: '/changePassword',
              body: {
                newPassword,
                currentPassword,
              },
            })
            if (result.success) {
              alert('Your password has been changed.')
              updateState({ confirmNewPassword: '', currentPassword: '', newPassword: '' })
              props.onUpdated && props.onUpdated()
              return
            }
          } catch (error) {
            /** */
          }
          alert('Failed to change your password')
        }}>
        {props.showCurrentPassword ? (
          <Input
            labelTitle="Current password"
            type="password"
            required
            onchange={(ev) => updateState({ currentPassword: (ev.target as HTMLInputElement).value }, true)}
          />
        ) : null}
        <Input
          labelTitle="New password"
          type="password"
          required
          onchange={(ev) => updateState({ newPassword: (ev.target as HTMLInputElement).value }, true)}
        />
        <Input
          labelTitle="Confirm new password"
          type="password"
          required
          onchange={(ev) => updateState({ confirmNewPassword: (ev.target as HTMLInputElement).value }, true)}
        />
        <Button variant="primary" type="submit">
          Change password
        </Button>
      </form>
    )
  },
})
