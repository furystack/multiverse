import { Shade, createComponent, LocationService } from '@furystack/shades'
import { Input, Button } from '@furystack/shades-common-components'
import { XpenseApiService, SessionService } from '@common/frontend-utils'
import { xpense } from '@common/models'

export const AddXpenseAccountPage = Shade<{}, Partial<xpense.Account>>({
  getInitialState: ({ injector }) => ({
    name: '',
    description: '',
    icon: '💳',
    owner: {
      type: 'user',
      username: injector.getInstance(SessionService).currentUser.getValue()?.username || '',
    },
    current: 0,
    history: [],
  }),
  render: ({ injector, getState, updateState }) => {
    return (
      <div style={{ background: 'rgba(128,128,128,0.03)', padding: '1em' }}>
        <h3>Create new account</h3>
        <form
          onsubmit={async (ev) => {
            ev.preventDefault()
            const account = getState()
            await injector.getInstance(XpenseApiService).call({
              method: 'POST',
              action: '/accounts',
              body: {
                ...account,
              },
            })
            history.pushState({}, '', '/xpense')
            injector.getInstance(LocationService).updateState()
          }}>
          <Input
            name="icon"
            required
            type="text"
            labelTitle="Icon"
            defaultValue={getState().icon}
            maxLength={1}
            onTextChange={(value) => updateState({ icon: value }, true)}
          />
          <Input
            name="name"
            required
            type="text"
            labelTitle="Name"
            onTextChange={(value) => updateState({ name: value }, true)}
          />
          <Input
            name="description"
            type="text"
            labelTitle="Description"
            multiLine
            className="account-description"
            onchange={(ev) => updateState({ description: (ev.target as any).value }, true)}
          />
          <Button type="button" onclick={() => history.back()} style={{ marginRight: '2em' }}>
            Back
          </Button>
          <Button type="submit" color="primary" variant="contained">
            Create Account
          </Button>
        </form>
      </div>
    )
  },
})
