import { Shade, createComponent, PartialElement } from '@furystack/shades'
import { LogLevel } from '@furystack/logging'
import { LogEntry } from 'common-models'

export const SystemLogs = Shade<unknown, { entries: Array<LogEntry<any>> }>({
  initialState: {
    entries: [],
  },
  shadowDomName: 'system-logs-page',
  constructed: async ({ injector, updateState }) => {
    const logStore = injector.getOdataServiceFor(LogEntry, 'logEntries')
    const entries = await logStore
      .query()
      .orderBy(['creationDate', 'desc'])
      .top(100)
      .exec()
    updateState({ entries: entries.value })
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
