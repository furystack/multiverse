import { Shade, createComponent } from '@furystack/shades'
import { Input, Button, styles } from '@common/components/src'
import { XpenseApiService } from '@common/frontend-utils/src'
import { AvailableAccountsContext } from './services/available-accounts-context'

export const AddXpenseAccountPage = Shade<{}, { name: string; description: string; icon: string }>({
  getInitialState: () => ({ name: '', description: '', icon: '💳' }),
  render: ({ injector, getState, updateState }) => {
    return (
      <div style={{ ...styles.glassBox, padding: '1em' }}>
        <h3>Create new account</h3>
        <form
          onsubmit={(ev) => {
            ev.preventDefault()
            const account = getState()
            injector
              .getInstance(XpenseApiService)
              .call({
                method: 'POST',
                action: '/accounts',
                body: account,
              })
              .then(() => {
                injector.getInstance(AvailableAccountsContext).reload()
                history.pushState({}, '', '/xpense')
              })
          }}>
          <Input required type="text" labelTitle="Icon" onTextChange={(value) => updateState({ icon: value }, true)} />
          <Input required type="text" labelTitle="Name" onTextChange={(value) => updateState({ name: value }, true)} />
          <Input
            type="text"
            labelTitle="Description"
            multiLine
            onchange={(ev) => updateState({ description: (ev.target as any).value }, true)}
          />
          <Button type="button" onclick={() => history.back()} style={{ marginRight: '2em' }}>
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
