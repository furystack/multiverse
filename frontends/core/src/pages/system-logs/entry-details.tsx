import { Shade, createComponent } from '@furystack/shades'
import { LogEntry } from '@common/models'
import { Button, Input, styles } from '@common/components'
import { DiagApiService } from '@common/frontend-utils'
import { Init } from '../init'
import { getLevelIcon } from './get-level-icon'

export const EntryDetails = Shade<{ guid: string }, { entry?: LogEntry<any>; error?: Error }>({
  shadowDomName: 'shade-system-log-entry-details',
  getInitialState: () => ({}),
  constructed: async ({ props, injector, updateState }) => {
    try {
      const entry = await injector.getInstance(DiagApiService).call({
        method: 'GET',
        action: '/logEntry/:_id',
        url: { _id: props.guid },
      })
      updateState({ entry })
    } catch (error) {
      updateState({ error })
    }
  },
  render: ({ getState }) => {
    const { error, entry } = getState()

    if (error) {
      return <div>:(</div>
    }

    if (!entry) {
      return <Init message="Loading Log entry..." />
    }
    return (
      <div
        style={{
          width: '100%',
          height: '100%',
          overflow: 'auto',
        }}>
        <div
          style={{
            padding: '2em',
            ...styles.glassBox,
          }}
          onclick={(ev) => ev.stopPropagation()}>
          <h1 style={{ marginTop: '0' }}>
            Event Details <span style={{ float: 'right' }}>{getLevelIcon(entry.level)} </span>
          </h1>
          <div>
            <Input labelTitle="Scope" disabled title="Scope" value={entry.scope} />
            <Input
              labelTitle="Message"
              disabled
              multiLine
              title="Message"
              value={entry.message}
              style={{ whiteSpace: 'pre-wrap' }}
            />
            <Input
              labelTitle="Details"
              // disabled
              multiLine
              title="Message"
              value={JSON.stringify(entry.data, undefined, 2)}
              style={{ whiteSpace: 'pre-wrap' }}
            />
            <Input
              labelTitle="Creation Date"
              disabled
              title="CreationDate"
              value={new Date(entry.creationDate || '').toLocaleString()}
            />
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <Button title="Ok" onclick={() => window.history.back()}>
              Back
            </Button>
          </div>
        </div>
      </div>
    )
  },
})
