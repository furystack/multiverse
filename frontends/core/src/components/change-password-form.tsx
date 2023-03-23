import { Shade, createComponent } from '@furystack/shades'
import { Input, Button, NotyService } from '@furystack/shades-common-components'
import { useAuthApi } from '@common/frontend-utils'
import { ResponseError } from '@furystack/rest-client-fetch'

export const ChangePasswordForm = Shade<{
  style?: Partial<CSSStyleDeclaration>
  showCurrentPassword?: boolean
  onUpdated?: () => void
}>({
  shadowDomName: 'shade-change-password-form',
  render: ({ props, useState, injector }) => {
    const [currentPassword, setCurrentPassword] = useState('currentPassword', '')
    const [newPassword, setNewPassword] = useState('newPassword', '')
    const [confirmNewPassword, setConfirmNewPassword] = useState('confirmNewPassword', '')

    return (
      <form
        style={props.style}
        onsubmit={async (ev) => {
          ev.preventDefault()
          if (newPassword !== confirmNewPassword) {
            injector.getInstance(NotyService).addNoty({
              type: 'warning',
              title: 'Cannot update password',
              body: 'The password and the password confirmation should be the same',
            })
            return
          }
          try {
            const { result } = await useAuthApi(injector)({
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
              setCurrentPassword('')
              setNewPassword('')
              setConfirmNewPassword('')
              props.onUpdated && props.onUpdated()
              return
            }
          } catch (error) {
            if (error instanceof ResponseError) {
              const responseJson = await error.response.json()
              injector.getInstance(NotyService).addNoty({
                type: 'error',
                title: 'Failed to update password',
                body: responseJson?.message || error.message || error.toString(),
              })
            } else {
              injector.getInstance(NotyService).addNoty({
                type: 'error',
                title: 'Failed to update password',
                body: 'An unknown error happened',
              })
            }
          }
        }}
      >
        {props.showCurrentPassword ? (
          <Input
            labelTitle="Current password"
            type="password"
            required
            name="currentPassword"
            onTextChange={setCurrentPassword}
          />
        ) : null}
        <Input labelTitle="New password" type="password" name="newPassword" required onTextChange={setNewPassword} />
        <Input
          labelTitle="Confirm new password"
          type="password"
          name="confirmNewPassword"
          required
          onTextChange={setConfirmNewPassword}
        />
        <Button color="primary" variant="contained" type="submit">
          Change password
        </Button>
      </form>
    )
  },
})
