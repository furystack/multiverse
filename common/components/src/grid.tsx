import { Shade, createComponent, ChildrenList, PartialElement } from '@furystack/shades'

// ToDo: https://stackoverflow.com/questions/51459971/type-of-generic-stateless-component-react-or-extending-generic-function-interfa

export interface GridOptions<T> {
  entries: T[]
  columns: Array<keyof T>
  headerComponents?: HeaderCells<T>
  rowComponents?: RowCells<T>
  select?: 'single' | 'multi' | 'none'
  styles?: {
    wrapper?: PartialElement<CSSStyleDeclaration>
    header?: PartialElement<CSSStyleDeclaration>
    cell?: PartialElement<CSSStyleDeclaration>
  }
}

export type HeaderCells<T> = {
  [TKey in keyof T]?: () => JSX.Element
}
export type RowCells<T> = {
  [TKey in keyof T]?: (element: T) => JSX.Element
}

export const Grid: <T>(props: GridOptions<T>, children: ChildrenList) => JSX.Element<any, any> = Shade({
  shadowDomName: 'shade-grid',
  render: ({ props }) => {
    const headerStyle: PartialElement<CSSStyleDeclaration> = {
      padding: '0 0.51em',
      backgroundColor: '#ccc',
      borderRadius: '2px',
      top: '0',
      position: 'sticky',
      cursor: 'pointer',
      fontVariant: 'all-petite-caps',
      ...props.styles?.header,
    }
    return (
      <div
        className="shade-grid-wrapper"
        style={{
          ...props.styles?.wrapper,
          width: '100%',
          height: '100%',
          overflow: 'auto',
        }}>
        <table style={{ width: '100%', position: 'relative' }}>
          <thead>
            <tr>
              {props.columns.map(column => {
                return <th style={headerStyle}>{props.headerComponents?.[column]?.() || <span>{column}</span>} </th>
              })}
            </tr>
          </thead>
          <tbody>
            {props.entries.map(entry => (
              <tr>
                {props.columns.map(column => (
                  <td style={props.styles?.cell}>
                    {props.rowComponents?.[column]?.(entry) || <span>{entry[column]}</span>}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )
  },
})
