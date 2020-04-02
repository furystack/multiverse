import { createComponent, Shade } from '@furystack/shades'
import { Tabs, styles, Avatar, Input } from 'common-components'
import { User, Profile } from 'common-models'
import { WrapRApiService, SessionService } from 'common-frontend-utils'
import { Init } from './init'

export const ProfilePage = Shade<{}, { currentUser?: User; profile?: Profile }>({
  getInitialState: () => ({}),
  constructed: async ({ injector, updateState }) => {
    const currentUser = injector.getInstance(SessionService).currentUser.getValue() as User
    const api = injector.getInstance(WrapRApiService)
    const profile = (await api.call({
      method: 'GET',
      action: '/profiles/:username',
      url: { username: currentUser.username },
    })) as Profile
    updateState({
      currentUser,
      profile,
    })
  },
  render: ({ getState }) => {
    const { currentUser, profile } = getState()
    if (!currentUser || !profile) {
      return <Init message="Loading profile..." />
    }
    return (
      <Tabs
        style={{ ...styles.glassBox, height: '100%', padding: '1em' }}
        tabs={[
          {
            header: <div>🎴 General info</div>,
            component: (
              <div>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <Avatar
                    user={currentUser}
                    style={{ display: 'inline-block', width: '3em', height: '3em', cursor: 'pointer' }}
                  />
                  <h3 style={{ marginLeft: '2em' }}>General Info</h3>
                </div>
                <Input type="text" labelTitle="Login name" value={currentUser.username} disabled />
                <Input type="text" labelTitle="Registration date" value={currentUser.registrationDate} disabled />
              </div>
            ),
          },
          {
            header: <div> 🧩 Connected accounts</div>,
            component: <div>Connect and disconnect 3rd party auth. accounts</div>,
          },
          { header: <div> 🔑 Change Password</div>, component: <div>Change Password form</div> },
        ]}
      />
    )
  },
})
