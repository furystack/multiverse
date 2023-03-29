import { Shade, createComponent } from '@furystack/shades'
import { Button, Form, Input, NotyService, Paper } from '@furystack/shades-common-components'
import { getRandomString } from '@common/models'
import { MyAvatar } from '@common/components'
import { MyAvatarService, SessionService, useAuthApi } from '@common/frontend-utils'

type UpdateProfilePayload = {
  displayName: string
  description: string
}

export const ProfileGeneralInfo = Shade({
  shadowDomName: 'shade-multiverse-profile-general-info',
  render: ({ injector, useObservable }) => {
    const sessionService = injector.getInstance(SessionService)

    const [profile] = useObservable('profile', sessionService.currentProfile)
    const [currentUser] = useObservable('currentUser', sessionService.currentUser)

    const uploadId = getRandomString()

    return (
      <Paper style={{ display: 'block', margin: '0' }}>
        <form
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-start', gap: '16px' }}
          onchange={async (ev) => {
            const form = (ev.target as any).form as HTMLFormElement
            if (form.checkValidity()) {
              const file: File = (form.elements[0] as any).files[0]
              try {
                await injector.getInstance(MyAvatarService).uploadAvatar(file)
                injector.getInstance(NotyService).addNoty({
                  type: 'success',
                  title: 'Success',
                  body: 'Your avatar has been updated',
                })
              } catch (error) {
                injector.getInstance(NotyService).addNoty({
                  type: 'error',
                  title: 'Error',
                  body: 'Something went wrong during updating your avatar',
                })
              }
            }
          }}
        >
          <label className="uploadAvatar" htmlFor={uploadId} style={{ cursor: 'pointer' }}>
            <MyAvatar style={{ display: 'inline-block', width: '3em', height: '3em', cursor: 'pointer' }} />
          </label>
          <input
            required
            name="avatar"
            id={uploadId}
            type="file"
            style={{ opacity: '0', position: 'absolute', zIndex: '-1' }}
          />
          <h3>{currentUser?.username}</h3>
        </form>

        <Form<UpdateProfilePayload>
          style={{
            display: 'flex',
            flexDirection: 'column',
          }}
          validate={(values): values is UpdateProfilePayload => {
            return !!values.displayName?.length
          }}
          onSubmit={async ({ displayName, description }) => {
            if (description !== profile.description || displayName !== profile.displayName) {
              try {
                await useAuthApi(injector)({
                  method: 'PATCH',
                  action: '/profiles/:id',
                  url: { id: profile._id },
                  body: { displayName, description },
                })
                await sessionService.reloadProfile()
                injector.getInstance(NotyService).addNoty({
                  type: 'success',
                  title: 'Success',
                  body: 'Your personal details has been updated.',
                })
              } catch (error) {
                injector.getInstance(NotyService).addNoty({
                  type: 'error',
                  title: 'Failed to save',
                  body: 'There was an error during saving your profile',
                })
              }
            }
          }}
        >
          <Input
            name="displayName"
            type="text"
            required
            labelTitle="Display name"
            value={profile.displayName}
            getHelperText={() => 'Your displayable name'}
          />
          <Input
            name="description"
            type="text"
            labelTitle="Short introduction"
            getHelperText={() => 'Write a few words about yourself'}
            value={profile.description}
          />
          <Button type="submit" variant="contained" style={{ alignSelf: 'flex-end' }}>
            Save Changes
          </Button>
        </Form>
        <div style={{ borderBottom: '1px solid rgba(128,128,128,0.3)' }} />
        <Input readOnly type="text" labelTitle="Registration date" value={currentUser?.registrationDate} />
        <Input readOnly type="text" labelTitle="Roles" value={currentUser?.roles.join(', ')} />
      </Paper>
    )
  },
})
