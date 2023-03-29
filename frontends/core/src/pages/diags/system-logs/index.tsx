import { Shade, createComponent, RouteLink } from '@furystack/shades'
import { LogLevel } from '@furystack/logging'
import type { diag } from '@common/models'
import { DataGrid, CollectionService } from '@furystack/shades-common-components'
import { useDiagApi } from '@common/frontend-utils'
import { getLevelIcon } from './get-level-icon'

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

export const SystemLogs = Shade({
  shadowDomName: 'system-logs-page',

  render: ({ useDisposable, injector }) => {
    const systemLogsService = useDisposable(
      'service',
      () =>
        new CollectionService<diag.LogEntry<any>>({
          loader: async (findOptions) => {
            const { result } = await useDiagApi(injector)({
              method: 'GET',
              action: '/logEntries',
              query: { findOptions },
            })
            return result
          },
          defaultSettings: { top: 20, order: { creationDate: 'DESC' } },
        }),
    )

    return (
      <div style={{ width: '100%', height: '100%' }}>
        <DataGrid<diag.LogEntry<any>>
          columns={['level', 'appName', 'scope', 'message', 'creationDate']}
          service={systemLogsService}
          styles={{
            cell: {
              textOverflow: 'ellipsis',
              overflow: 'hidden',
            },
            wrapper: { background: 'rgba(128,128,128,0.03)' },
          }}
          headerComponents={{}}
          rowComponents={{
            level: (entry) => <LogLevelCell level={entry.level} />,
            message: (entry) => (
              <RouteLink href={`/diags/logs/${entry._id}`}>
                <span style={{ wordBreak: 'break-all' }}>{entry.message}</span>
              </RouteLink>
            ),
            creationDate: (entry) => <span>{entry.creationDate.toString().replace(/([T|Z])/g, ' ')}</span>,
          }}
        />
      </div>
    )
  },
})
