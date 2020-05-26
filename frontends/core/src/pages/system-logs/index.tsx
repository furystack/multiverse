import { Shade, createComponent, LocationService } from '@furystack/shades'
import { LogLevel } from '@furystack/logging'
import { LogEntry } from '@common/models'
import { DataGrid, styles } from '@common/components'
import { DiagApiService, CollectionService } from '@common/frontend-utils'
import { getLevelIcon } from './get-level-icon'

export interface SystemLogsState {
  error?: Error
  selectedEntry?: LogEntry<any>
  systemLogsService: CollectionService<LogEntry<any>>
}

export const LogLevelCell = Shade<{ level: LogLevel }>({
  shadowDomName: 'log-level-cell',
  render: ({ props }) => {
    return <span title={LogLevel[props.level]}>{getLevelIcon(props.level)}</span>
  },
})

export const SystemLogs = Shade<unknown, SystemLogsState>({
  shadowDomName: 'system-logs-page',
  getInitialState: ({ injector }) => ({
    systemLogsService: new CollectionService<LogEntry<any>>(
      (filter) =>
        injector.getInstance(DiagApiService).call({
          method: 'GET',
          action: '/logEntries',
          query: { filter },
        }),
      { top: 20, order: { creationDate: 'DESC' } },
    ),
  }),
  render: ({ getState, injector }) => {
    return (
      <div style={{ width: '100%', height: '100%' }}>
        <DataGrid<LogEntry<any>>
          columns={['level', 'appName', 'scope', 'message', 'creationDate']}
          service={getState().systemLogsService}
          styles={{
            cell: {
              textAlign: 'center',
              textOverflow: 'ellipsis',
              overflow: 'hidden',
            },
            wrapper: styles.glassBox,
          }}
          headerComponents={{}}
          rowComponents={{
            level: (entry) => <LogLevelCell level={entry.level} />,
            message: (entry) => <span style={{ wordBreak: 'break-all' }}>{entry.message}</span>,
            creationDate: (entry) => <span>{entry.creationDate.toString().replace(/([T|Z])/g, ' ')}</span>,
          }}
          onDoubleClick={(entry) => {
            window.history.pushState('', '', `/sys-logs/${entry._id}`)
            injector.getInstance(LocationService).updateState()
          }}
        />
      </div>
    )
  },
})
