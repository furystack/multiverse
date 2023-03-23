import { SuggestUser, SuggestOrganization, Avatar } from '@common/components'
import type { auth, Owner } from '@common/models'
import { createComponent, Shade } from '@furystack/shades'
import { Button, NotyService, ThemeProviderService } from '@furystack/shades-common-components'
import alarm from '../animations/alarm.json'
import { Icon } from './icon'

export interface TransferOwnershipProps {
  name: string
  currentOwner: Owner
  onTransfer: (newOwner: Owner) => Promise<void>
}

export const isProfile = (owner: any): owner is auth.Profile => {
  return (owner as auth.Profile).username ? true : false
}

export const TransferOwnership = Shade<TransferOwnershipProps>({
  shadowDomName: 'multiverse-transfer-ownership',
  render: ({ props, injector, useState }) => {
    const [newOwner, setNewOwner] = useState<auth.Profile | auth.Organization | undefined>('newOwner', undefined)

    const [newOwnerEntry, setNewOwnerEntry] = useState<Owner | undefined>('newOwnerEntry', undefined)

    const [understood, setUnderstood] = useState('understood', false)

    return (
      <div style={{ padding: '1em 2em' }}>
        <h1>
          Transfer ownership: <strong>{props.name}</strong>
        </h1>
        {!understood ? (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexDirection: 'column',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <lottie-player
                autoplay
                style={{ width: '192px' }}
                loop={false}
                src={JSON.stringify(alarm)}
              ></lottie-player>
              <p style={{ color: injector.getInstance(ThemeProviderService).theme.palette.warning.main }}>
                You are going to transfer the ownership of this entry to an another organization or user. This operation
                can cause that you'll lost access to your belongings and this <strong>cannot be undone</strong> so think
                it twice.
              </p>
            </div>
            <div>
              The current owner is:{' '}
              <strong>
                {props.currentOwner.type === 'organization'
                  ? props.currentOwner.organizationName
                  : props.currentOwner.type === 'user'
                  ? props.currentOwner.username
                  : 'System'}
              </strong>
            </div>
            <Button
              variant="contained"
              color="warning"
              style={{ padding: '1em 2em' }}
              onclick={() => setUnderstood(true)}
            >
              Understood
            </Button>
          </div>
        ) : (
          <div>
            {newOwner && newOwnerEntry ? (
              <div>
                <h3>The new owner will be: </h3>
                {isProfile(newOwner) ? (
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexDirection: 'column',
                    }}
                  >
                    <Avatar
                      userName={newOwner.username}
                      style={{ width: '48px', height: '48px', marginBottom: '2em' }}
                    />
                    <h4>{newOwner.username}</h4>
                  </div>
                ) : (
                  <div style={{ textAlign: 'center' }}>
                    <span style={{ fontSize: '48px', marginBottom: '2em' }}>{newOwner.icon}</span>
                    <h4>{newOwner.name}</h4>
                  </div>
                )}
              </div>
            ) : (
              <div style={{ display: 'flex' }}>
                <label style={{ flexGrow: '1', margin: '1em', textAlign: 'center' }}>
                  <Icon
                    icon={{ type: 'flaticon-essential', name: '363-user.svg' }}
                    elementProps={{ style: { width: '64px' } }}
                  />
                  <br />
                  Select a user:
                  <SuggestUser
                    prefix="🔑"
                    onSelectUser={(user) => {
                      setNewOwner(user)
                      setNewOwnerEntry({
                        type: 'user',
                        username: user.username,
                      })
                    }}
                  />
                </label>

                <label style={{ flexGrow: '1', margin: '1em', textAlign: 'center' }}>
                  <Icon
                    icon={{ type: 'flaticon-essential', name: '092-network.svg' }}
                    elementProps={{ style: { width: '64px' } }}
                  />
                  <br />
                  Or select an Organization:
                  <SuggestOrganization
                    prefix="🔑"
                    onSelectOrganization={(org) => {
                      setNewOwner(org)
                      setNewOwnerEntry({
                        type: 'organization',
                        organizationName: org.name,
                      })
                    }}
                  />
                </label>
              </div>
            )}
            <div
              style={{
                display: 'flex',
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Button
                disabled={newOwner === undefined || newOwnerEntry === undefined}
                style={{ padding: '1em 2em' }}
                onclick={() => {
                  setNewOwner(undefined)
                  setNewOwnerEntry(undefined)
                }}
              >
                Select something else...
              </Button>
              <Button
                disabled={newOwner === undefined || newOwnerEntry === undefined}
                variant="contained"
                color="warning"
                style={{ padding: '1em 2em' }}
                onclick={async () => {
                  try {
                    if (newOwnerEntry) {
                      await props.onTransfer(newOwnerEntry)
                      injector.getInstance(NotyService).addNoty({
                        type: 'success',
                        body: `The ownership of '${props.name}' has been succesfully transfered`,
                        title: 'Success',
                      })
                    }
                  } catch (error) {
                    injector.getInstance(NotyService).addNoty({
                      type: 'error',
                      body: `Failed to transfer the ownership of '${props.name}'`,
                      title: 'Error',
                    })
                  }
                }}
              >
                Transfer Ownership
              </Button>
            </div>
          </div>
        )}
      </div>
    )
  },
})
