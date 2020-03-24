import { Shade, createComponent } from '@furystack/shades'
import { LogLevel } from '@furystack/logging'
import { LogEntry } from 'common-models'
import { DataGrid, styles } from 'common-components'
import { LoggRApiService, CollectionService } from 'common-frontend-utils'
import { EntryDetails } from './entry-details'
import { getLevelIcon } from './get-level-icon'

export interface SystemLogsState {
  error?: Error
  isDetailsOpened: boolean
  selectedEntry?: LogEntry<any>
  systemLogsService: CollectionService<LogEntry<any> & { details: any }>
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
    isDetailsOpened: false,
    systemLogsService: new CollectionService((filter) =>
      injector.getInstance(LoggRApiService).call({
        method: 'GET',
        action: '/entries',
        query: { filter: JSON.stringify(filter) },
      } as any),
    ) as CollectionService<LogEntry<any> & { details: any }>,
  }),
  render: ({ getState }) => {
    return (
      <div style={{ width: '100%', height: '100%' }}>
        <DataGrid<LogEntry<any> & { details: any }>
          columns={['level', 'appName', 'scope', 'message', 'creationDate', 'details']}
          service={getState().systemLogsService}
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
            details: (entry) => <EntryDetails entry={entry} />,
          }}
        />
      </div>
    )
  },
})
