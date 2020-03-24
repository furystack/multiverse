import { SearchOptions } from '@furystack/core'
import { ChildrenList, createComponent, Shade, PartialElement } from '@furystack/shades'
import { CollectionService } from 'common-frontend-utils'
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
  service: CollectionService<T>
  defaultOptions: SearchOptions<T, any>
  headerComponents: DataHeaderCells<T>
  rowComponents: DataRowCells<T>
  onSelectionChange?: (selection: T[]) => void
  onFocusChange?: (focus: T) => void
}

export interface DataGridState<T> {
  entries: T[]
  isLoading: boolean
  selection: T[]
  focus?: T
  error?: Error
  order?: keyof T
  orderDirection?: 'ASC' | 'DESC'
}

export const DataGrid: <T>(props: DataGridProps<T>, children: ChildrenList) => JSX.Element<any, any> = Shade({
  shadowDomName: 'shade-data-grid',
  getInitialState: () =>
    ({
      entries: [],
      isLoading: false,
      selection: [],
    } as DataGridState<any>),
  constructed: ({ props, updateState }) => {
    const itemsSubscription = props.service.entries.subscribe((entries) => updateState({ entries }))
    return () => itemsSubscription.dispose()
  },
  render: ({ props, getState, updateState }) => {
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
                  <th
                    style={headerStyle}
                    onclick={() => {
                      const currentState = getState()
                      const currentQuerySettings = props.service.querySettings.getValue()
                      let newDirection: 'ASC' | 'DESC' = 'ASC'
                      const newOrder: { [K in keyof any]: 'ASC' | 'DESC' } = {}

                      if (currentState.order === column) {
                        newDirection = currentState.orderDirection === 'ASC' ? 'DESC' : 'ASC'
                      }
                      newOrder[column] = newDirection
                      props.service.querySettings.setValue({
                        ...currentQuerySettings,
                        order: newOrder,
                      })
                      updateState({ order: column, orderDirection: newDirection })
                    }}>
                    {props.headerComponents?.[column]?.(column, state) ||
                      props.headerComponents?.default?.(column, state) || <span>{column}</span>}{' '}
                  </th>
                )
              })}
            </tr>
          </thead>
          <tbody>
            {state.entries.map((entry) => (
              <tr
                style={{
                  background: state.selection.includes(entry) ? 'rgba(128,128,128,0.3)' : 'transparent',
                  filter: state.focus === entry ? 'brightness(1.5)' : 'brightness(1)',
                  cursor: 'default',
                }}
                onclick={() => {
                  updateState({ focus: entry })
                  props.onSelectionChange && props.onSelectionChange([entry])
                  props.onFocusChange && props.onFocusChange(entry)
                }}>
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
