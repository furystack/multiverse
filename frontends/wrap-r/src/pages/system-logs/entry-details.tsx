import { Shade, createComponent } from '@furystack/shades'
import { LogEntry } from 'common-models'
import { Button, Modal, Input } from 'common-components'
import { getLevelIcon } from './get-level-icon'

export const EntryDetails = Shade<{ entry: LogEntry<any> }, { isDetailsOpened: boolean }>({
  shadowDomName: 'shade-system-log-entry-details',
  getInitialState: () => ({ isDetailsOpened: false }),
  render: ({ props, updateState, getState }) => {
    return (
      <div>
        {getState().isDetailsOpened ? (
          <Modal isVisible={true} onClose={() => updateState({ isDetailsOpened: false })}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '100%',
                height: '100%',
              }}>
              <div
                style={{
                  background: '#252525',
                  padding: '2em',
                  borderRadius: '3px',
                  boxShadow: 'rgba(0,0,0, 0.2) 5px 5px 10px 15px',
                  minWidth: '350px',
                }}
                onclick={(ev) => ev.stopPropagation()}>
                <h1 style={{ marginTop: '0' }}>
                  Event Details <span style={{ float: 'right' }}>{getLevelIcon(props.entry.level)} </span>
                </h1>
                <div>
                  <Input labelTitle="Scope" disabled title="Scope" value={props.entry.scope} />
                  <Input
                    labelTitle="Message"
                    disabled
                    multiLine
                    title="Message"
                    value={props.entry.message}
                    style={{ whiteSpace: 'pre-wrap' }}
                  />
                  <Input
                    labelTitle="Details"
                    // disabled
                    multiLine
                    title="Message"
                    value={JSON.stringify(props.entry.data, undefined, 2)}
                    style={{ whiteSpace: 'pre-wrap' }}
                  />
                  <Input
                    labelTitle="Creation Date"
                    disabled
                    title="CreationDate"
                    value={new Date(props.entry.creationDate || '').toLocaleString()}
                  />
                </div>
                <hr />
                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <Button title="Ok" onclick={() => updateState({ isDetailsOpened: false })}>
                    Close
                  </Button>
                </div>
              </div>
            </div>
          </Modal>
        ) : null}
        <Button
          title="Show details"
          onclick={(ev) => {
            ev.stopPropagation()
            updateState({ isDetailsOpened: true })
          }}>
          🔍
        </Button>
      </div>
    )
  },
})
