import { Shade, createComponent } from '@furystack/shades'
import { LogLevel } from '@furystack/logging'
import { LogEntry } from 'common-models'
import { Grid, Button, Modal, Input } from 'common-components'
import { LoggRApiService } from 'common-frontend-utils'

export interface SystemLogsState {
  entries: Array<LogEntry<any>>
  orderBy: keyof LogEntry<any>
  orderDirection: 'ASC' | 'DESC'
  levels: LogLevel[]
  scope?: string
  message?: string
  top?: number
  skip?: number
  isDetailsOpened: boolean
  selectedEntry?: LogEntry<any>
}

export const getLevelIcon = (level: LogLevel) => {
  switch (level) {
    case LogLevel.Fatal:
      return '☣'
    case LogLevel.Error:
      return '🛑'
    case LogLevel.Warning:
      return '⚠'
    case LogLevel.Information:
      return 'ℹ'
    case LogLevel.Debug:
      return '🐛'
    case LogLevel.Verbose:
      return '🦜'
    default:
      return LogLevel[level]
  }
}

export const LogLevelCell = Shade<{ level: LogLevel }>({
  shadowDomName: 'log-level-cell',
  render: ({ props }) => {
    return <span>{getLevelIcon(props.level)}</span>
  },
})

export const SystemLogs = Shade<unknown, SystemLogsState>({
  initialState: {
    entries: [],
    orderBy: '_id',
    orderDirection: 'DESC',
    levels: [LogLevel.Information, LogLevel.Warning, LogLevel.Error, LogLevel.Fatal],
    isDetailsOpened: false,
  },
  shadowDomName: 'system-logs-page',
  constructed: async ({ getState, injector, updateState }) => {
    const logApi = injector.getInstance(LoggRApiService)
    const { entries: e, ...query } = getState()
    const entries = await logApi.call({
      method: 'GET',
      action: '/entries',
      query,
    })
    updateState({ entries })
  },
  render: ({ getState, updateState }) => {
    const { entries, isDetailsOpened, selectedEntry } = getState()
    return (
      <div style={{ width: '100%', height: '100%' }}>
        <Grid<LogEntry<any> & { details?: undefined }>
          entries={entries}
          columns={['level', 'scope', 'message', 'creationDate', 'details']}
          select="single"
          styles={{
            cell: {
              textAlign: 'center',
            },
          }}
          rowComponents={{
            level: entry => <LogLevelCell level={entry.level} />,
            details: entry => {
              return (
                <Button
                  title="Show details"
                  onclick={() => updateState({ isDetailsOpened: true, selectedEntry: entry })}>
                  🔍
                </Button>
              )
            },
          }}
        />
        <Modal isVisible={isDetailsOpened} onClose={() => updateState({ isDetailsOpened: false })}>
          <div
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', height: '100%' }}>
            <div
              style={{
                background: '#ccc',
                padding: '1em',
                borderRadius: '3px',
                boxShadow: 'rgba(128, 128, 128, 0.5) 5px 5px 10px',
                minWidth: '350px',
              }}
              onclick={ev => ev.stopPropagation()}>
              <h1 style={{ marginTop: '0' }}>
                Event Details{' '}
                <span style={{ float: 'right' }}>{getLevelIcon(selectedEntry?.level || LogLevel.Information)} </span>
              </h1>
              <div>
                <Input labelTitle="Scope" disabled title="Scope" value={selectedEntry?.scope} />
                <Input
                  labelTitle="Message"
                  disabled
                  multiLine
                  title="Message"
                  value={selectedEntry?.message}
                  style={{ whiteSpace: 'pre-wrap' }}
                />
                <Input
                  labelTitle="Details"
                  // disabled
                  multiLine
                  title="Message"
                  value={JSON.stringify(selectedEntry?.data, undefined, 2)}
                  style={{ whiteSpace: 'pre-wrap' }}
                />
                <Input
                  labelTitle="Creation Date"
                  disabled
                  title="CreationDate"
                  value={new Date(selectedEntry?.creationDate || '').toLocaleString()}
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
      </div>
    )
  },
})
