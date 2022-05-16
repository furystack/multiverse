import { Shade, createComponent, LocationService } from '@furystack/shades'
import { LogLevel } from '@furystack/logging'
import { diag } from '@common/models'
import { DataGrid, CollectionService } from '@furystack/shades-common-components'
import { DiagApiService } from '@common/frontend-utils'
import { getLevelIcon } from './get-level-icon'

export interface SystemLogsState {
  error?: Error
  selectedEntry?: diag.LogEntry<any>
  systemLogsService: CollectionService<diag.LogEntry<any>>
}

export const LogLevelCell = Shade<{ level: LogLevel }>({
  shadowDomName: 'log-level-cell',
  render: ({ props }) => {
    return (
      <span
        style={{
          display: 'inline-flex',
          width: '100%',
          height: '100%',
          alignItems: 'center',
          justifyContent: 'center',
        }}
        title={LogLevel[props.level]}
      >
        {getLevelIcon(props.level)}
      </span>
    )
  },
})

export const SystemLogs = Shade<unknown, SystemLogsState>({
  shadowDomName: 'system-logs-page',
  getInitialState: ({ injector }) => ({
    systemLogsService: new CollectionService<diag.LogEntry<any>>(
      async (findOptions) => {
        const { result } = await injector.getInstance(DiagApiService).call({
          method: 'GET',
          action: '/logEntries',
          query: { findOptions },
        })
        return result
      },
      { top: 20, order: { creationDate: 'DESC' } },
    ),
  }),
  render: ({ getState, injector }) => {
    return (
      <div style={{ width: '100%', height: '100%' }}>
        <DataGrid<diag.LogEntry<any>>
          columns={['level', 'appName', 'scope', 'message', 'creationDate']}
          service={getState().systemLogsService}
          styles={{
            cell: {
              // textAlign: 'center',
              textOverflow: 'ellipsis',
              overflow: 'hidden',
            },
            wrapper: { background: 'rgba(128,128,128,0.03)' },
          }}
          headerComponents={{}}
          rowComponents={{
            level: (entry) => <LogLevelCell level={entry.level} />,
            message: (entry) => <span style={{ wordBreak: 'break-all' }}>{entry.message}</span>,
            creationDate: (entry) => <span>{entry.creationDate.toString().replace(/([T|Z])/g, ' ')}</span>,
          }}
          onDoubleClick={(entry) => {
            window.history.pushState('', '', `/diags/logs/${entry._id}`)
            injector.getInstance(LocationService).updateState()
          }}
        />
      </div>
    )
  },
})
