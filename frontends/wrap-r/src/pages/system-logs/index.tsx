import { Shade, createComponent, RouteLink } from '@furystack/shades'
import { LogLevel } from '@furystack/logging'
import { LogEntry } from 'common-models'
import { DataGrid, styles } from 'common-components'
import { LoggRApiService, CollectionService } from 'common-frontend-utils'
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
        injector.getInstance(LoggRApiService).call({
          method: 'GET',
          action: '/entries',
          query: { filter: JSON.stringify(filter) },
        }),
      { top: 20, order: { creationDate: 'DESC' } },
    ) as CollectionService<LogEntry<any>>,
  }),
  render: ({ getState }) => {
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
            level: (entry) => (
              <RouteLink href={`/sys-logs/${entry._id}`}>
                <LogLevelCell level={entry.level} />
              </RouteLink>
            ),
            message: (entry) => <span style={{ wordBreak: 'break-all' }}>{entry.message}</span>,
            creationDate: (entry) => <span>{entry.creationDate.toString().replace(/([T|Z])/g, ' ')}</span>,
          }}
        />
      </div>
    )
  },
})