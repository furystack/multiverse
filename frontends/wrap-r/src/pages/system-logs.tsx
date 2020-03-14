import { Shade, createComponent, PartialElement } from '@furystack/shades'
import { LogLevel } from '@furystack/logging'
import { LogEntry } from 'common-models'

export interface SystemLogsState {
  entries: Array<LogEntry<any>>
  order: [keyof LogEntry<any>, 'asc' | 'desc']
  minLevel: LogLevel
}

export const SystemLogs = Shade<unknown, SystemLogsState>({
  initialState: {
    entries: [],
    order: ['_id', 'desc'],
    minLevel: LogLevel.Information,
  },
  shadowDomName: 'system-logs-page',
  constructed: async ({ updateState }) => {
    // ToDo: Separate service?
    // const state = getState()
    // const logStore = injector.getOdataServiceFor(LogEntry, 'logEntries')
    // const entries = await logStore
    //   .query()
    //   .buildFilter(f => f.greaterThan('level', state.minLevel))
    //   .orderBy(state.order)
    //   .top(100)
    //   .exec()
    updateState({ entries: [] })
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
