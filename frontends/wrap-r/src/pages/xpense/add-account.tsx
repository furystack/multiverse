import { Shade, createComponent } from '@furystack/shades'
import { Input, Button } from 'common-components/src'
import { XpenseApiService } from 'common-frontend-utils/src'

export const AddXpenseAccountPage = Shade<{}, { accountName: string }>({
  getInitialState: () => ({ accountName: '' }),
  render: ({ injector, getState, updateState }) => {
    return (
      <div>
        <form
          onsubmit={(ev) => {
            ev.preventDefault()
            const { accountName: name } = getState()
            injector.getInstance(XpenseApiService).call({
              method: 'POST',
              action: '/accounts',
              body: {
                name,
              },
            })
          }}>
          <Input
            type="text"
            labelTitle="Name"
            onchange={(ev) => updateState({ accountName: (ev.target as any).value }, true)}
          />
          <Input type="text" labelTitle="Description" multiLine />
          <Button onclick={() => history.back()} style={{ marginRight: '2em' }}>
            Back
          </Button>
          <Button type="submit" variant="primary">
            Create Account
          </Button>
        </form>
      </div>
    )
  },
})
