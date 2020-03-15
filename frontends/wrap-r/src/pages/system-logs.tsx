import { Shade, createComponent, PartialElement } from '@furystack/shades'
import { LogLevel } from '@furystack/logging'
import { LogEntry } from 'common-models'
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
}

export const SystemLogs = Shade<unknown, SystemLogsState>({
  initialState: {
    entries: [],
    orderBy: '_id',
    orderDirection: 'DESC',
    levels: [LogLevel.Information, LogLevel.Warning, LogLevel.Error, LogLevel.Fatal],
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
  render: ({ getState }) => {
    const headerStyle: PartialElement<CSSStyleDeclaration> = {
      boxShadow: '-2px -2px 3px rgba(0,0,0,0.2) inset',
      backgroundColor: '#ccc',
      top: '0',
      position: 'sticky',
    }

    return (
      <div
        style={{
          width: '100%',
          height: '100%',
          overflow: 'auto',
        }}>
        <table style={{ width: '100%', position: 'relative' }}>
          <thead>
            <tr>
              <th style={headerStyle}>Level</th>
              <th style={headerStyle}>Scope</th>
              <th style={headerStyle}>Message</th>
              <th style={headerStyle}>Date </th>
            </tr>
          </thead>
          <tbody>
            {getState().entries.map(entry => (
              <tr>
                <td style={{ textAlign: 'center' }}>{LogLevel[entry.level]}</td>
                <td style={{ textAlign: 'center' }}>{entry.scope}</td>
                <td>{entry.message}</td>
                <td style={{ textAlign: 'center' }}>{entry.creationDate}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {/* <div style={{ width: '100%', overflow: 'auto' }}>
          {getState().entries.map(entry => (
            <div>
              {LogLevel[entry.level]} -{entry.message}
            </div>
          ))}
        </div> */}
      </div>
    )
  },
})
