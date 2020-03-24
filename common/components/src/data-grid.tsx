import { SearchOptions } from '@furystack/core'
import { ChildrenList, createComponent, Shade, PartialElement } from '@furystack/shades'
import { EntryLoader, CollectionService } from 'common-frontend-utils'
import { GridProps } from './grid'

export type DataHeaderCells<T> = {
  [TKey in keyof T | 'default']?: (name: keyof T, state: DataGridState<T>) => JSX.Element
}
export type DataRowCells<T> = {
  [TKey in keyof T | 'default']?: (element: T, state: DataGridState<T>) => JSX.Element
}

export interface DataGridProps<T> {
  columns: Array<keyof T>
  styles: GridProps<T>['styles']
  loadItems: EntryLoader<T>
  defaultOptions: SearchOptions<T, any>
  headerComponents: DataHeaderCells<T>
  rowComponents: DataRowCells<T>
}

export interface DataGridState<T> {
  service: CollectionService<T>
  entries: T[]
  isLoading: boolean
  selection: T[]
  error?: Error
  order?: keyof T
  orderDirection?: 'ASC' | 'DESC'
}

export const DataGrid: <T>(props: DataGridProps<T>, children: ChildrenList) => JSX.Element<any, any> = Shade({
  shadowDomName: 'shade-data-grid',
  initialState: {
    service: {} as CollectionService<any>,
    entries: [],
    isLoading: false,
    selection: [],
  } as DataGridState<any>,
  constructed: ({ props, updateState, getState }) => {
    const service = new CollectionService(props.loadItems)
    service.entries.subscribe((entries) => updateState({ entries }))
    updateState({ service })
    return () => getState().service.dispose()
  },
  render: ({ props, getState }) => {
    const state = getState()

    if (state.isLoading) {
      return <div>Loading...</div>
    }
    if (state.error) {
      return <div style={{ color: 'red' }}>{JSON.stringify(state.error)}</div>
    }

    const headerStyle: PartialElement<CSSStyleDeclaration> = {
      padding: '0 0.51em',
      backgroundColor: '#333',
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
              {props.columns.map((column) => {
                return (
                  <th style={headerStyle}>
                    {props.headerComponents?.[column]?.(column, state) ||
                      props.headerComponents?.default?.(column, state) || <span>{column}</span>}{' '}
                  </th>
                )
              })}
            </tr>
          </thead>
          <tbody>
            {state.entries.map((entry) => (
              <tr>
                {props.columns.map((column) => (
                  <td style={props.styles?.cell}>
                    {props.rowComponents?.[column]?.(entry, state) || props.rowComponents?.default?.(entry, state) || (
                      <span>{entry[column]}</span>
                    )}
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
