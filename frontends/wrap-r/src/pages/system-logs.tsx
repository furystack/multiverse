import { Shade, createComponent } from '@furystack/shades'
import { LogLevel } from '@furystack/logging'
import { LogEntry } from 'common-models'
import { Button, Modal, Input, DataGrid, styles } from 'common-components'
import { LoggRApiService } from 'common-frontend-utils'

export interface SystemLogsState {
  error?: Error
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
    return <span title={LogLevel[props.level]}>{getLevelIcon(props.level)}</span>
  },
})

export const SystemLogs = Shade<unknown, SystemLogsState>({
  initialState: {
    isDetailsOpened: false,
  },
  shadowDomName: 'system-logs-page',
  render: ({ getState, updateState, injector }) => {
    const { isDetailsOpened, selectedEntry } = getState()
    return (
      <div style={{ width: '100%', height: '100%' }}>
        <DataGrid<LogEntry<any> & { details: any }>
          columns={['level', 'appName', 'scope', 'message', 'creationDate', 'details']}
          loadItems={(filter) =>
            injector
              .getInstance(LoggRApiService)
              .call({ method: 'GET', action: '/entries', query: { filter: JSON.stringify(filter) } })
          }
          styles={{
            cell: {
              textAlign: 'center',
              textOverflow: 'ellipsis',
              overflow: 'hidden',
            },
            wrapper: styles.glassBox,
          }}
          defaultOptions={{}}
          headerComponents={{}}
          rowComponents={{
            level: (entry) => <LogLevelCell level={entry.level} />,
            message: (entry) => <span style={{ wordBreak: 'break-all' }}>{entry.message}</span>,
            creationDate: (entry) => <span>{entry.creationDate.toString().replace('T', ' ')}</span>,
            details: (entry) => {
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
        {/* <Grid<LogEntry<any> & { details?: undefined }>
          entries={entries}
          columns={['level', 'scope', 'message', 'creationDate', 'details']}
          headerComponents={{
            default: (name) => {
              const isOrderedBy = getState().settings.orderBy === name
              const { orderDirection } = getState().settings
              return (
                <span
                  style={{
                    fontWeight: isOrderedBy ? 'bolder' : 'lighter',
                    display: 'flex',
                    padding: '1em',
                    whiteSpace: 'nowrap',
                    justifyContent: 'space-between',
                    flexWrap: 'nowrap',
                  }}
                  onclick={() => {
                    if (name === 'details') {
                      return
                    }
                    const state = getState()
                    if (state.settings.orderBy === name) {
                      const newDirection = state.settings.orderDirection === 'ASC' ? 'DESC' : 'ASC'
                      injector
                        .getInstance(LoggREntries)
                        .settings.setValue({ ...state.settings, orderDirection: newDirection })
                    } else {
                      injector.getInstance(LoggREntries).settings.setValue({ ...state.settings, orderBy: name })
                    }
                  }}>
                  {name}
                  {isOrderedBy ? (
                    orderDirection === 'ASC' ? (
                      <span style={{ float: 'right' }}> ⬆️</span>
                    ) : (
                      <span style={{ float: 'right' }}> ⬇️</span>
                    )
                  ) : null}
                </span>
              )
            },
          }}
        /> */}
        <Modal isVisible={isDetailsOpened} onClose={() => updateState({ isDetailsOpened: false })}>
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
