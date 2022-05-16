import { Shade, createComponent, LocationService } from '@furystack/shades'
import { Input, Button } from '@furystack/shades-common-components'
import { SessionService, XpenseApiService } from '@common/frontend-utils'
import { xpense } from '@common/models'
import { WithOptionalId } from '@furystack/core'
import { FullScreenForm } from '../../components/full-screen-form'

export const AddXpenseAccountPage = Shade<{}, WithOptionalId<xpense.Account, '_id'>>({
  shadowDomName: 'add-xpense-account-page',
  getInitialState: ({ injector }) => {
    const user = injector.getInstance(SessionService).currentUser.getValue()
    return {
      name: '',
      description: '',
      icon: '💳',
      creationDate: new Date().toISOString(),
      createdBy: user?._id || '',
      current: 0,
      history: [],
      owner: {
        type: 'user',
        username: user?.username || '',
      },
    }
  },
  render: ({ injector, getState, updateState }) => {
    return (
      <FullScreenForm
        title="Create New Xpense Account"
        actions={
          <div>
            <Button variant="outlined" type="button" onclick={() => history.back()}>
              Back
            </Button>
            <Button type="submit" color="primary" variant="contained">
              Create Account
            </Button>
          </div>
        }
        onSubmit={async (ev) => {
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
          name="name"
          required
          type="text"
          labelTitle="Name"
          onTextChange={(value) => updateState({ name: value }, true)}
        />
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
          name="description"
          type="text"
          labelTitle="Description"
          multiLine
          className="account-description"
          onchange={(ev) => updateState({ description: (ev.target as any).value }, true)}
        />
      </FullScreenForm>
    )
  },
})
