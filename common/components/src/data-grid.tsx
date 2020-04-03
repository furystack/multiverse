import { ChildrenList, createComponent, Shade, PartialElement } from '@furystack/shades'
import { CollectionService } from 'common-frontend-utils'
import { GridProps } from './grid'
import { colors } from './styles'

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
  headerComponents: DataHeaderCells<T>
  rowComponents: DataRowCells<T>
  onSelectionChange?: (selection: T[]) => void
  onFocusChange?: (focus: T) => void
  onDoubleClick?: (entry: T) => void
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

export const DataGrid: <T>(props: DataGridProps<T>, children: ChildrenList) => JSX.Element<any, any> = Shade<
  DataGridProps<any>,
  DataGridState<any>
>({
  shadowDomName: 'shade-data-grid',
  getInitialState: ({ props }) =>
    ({
      entries: [],
      isLoading: false,
      selection: [],
      order: Object.keys(props.service.querySettings.getValue().order || {})[0],
      orderDirection: Object.values(props.service.querySettings.getValue().order || {})[0],
    } as DataGridState<any>),
  constructed: ({ props, updateState }) => {
    const subscriptions = [
      props.service.entries.subscribe((entries) => updateState({ entries })),
      props.service.error.subscribe((error) => updateState({ error })),
      props.service.isLoading.subscribe((isLoading) => updateState({ isLoading })),
    ]
    return () => Promise.all(subscriptions.map((s) => s.dispose()))
  },
  render: ({ props, getState, updateState }) => {
    const state = getState()
    if (state.error) {
      return <div style={{ color: colors.error.main }}>{JSON.stringify(state.error)}</div>
    }

    const headerStyle: PartialElement<CSSStyleDeclaration> = {
      padding: '1em 3em',
      backgroundColor: '#333',
      borderRadius: '2px',
      top: '0',
      position: 'sticky',
      cursor: 'pointer',
      fontVariant: 'all-petite-caps',
      zIndex: '1',
      boxShadow: '3px 3px 4px rgba(0,0,0,0.3)',
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
          zIndex: '1',
        }}>
        <table style={{ width: '100%', position: 'relative' }}>
          <thead>
            <tr>
              {props.columns.map((column: any) => {
                return (
                  <th
                    style={headerStyle}
                    onmouseenter={(ev) => {
                      ;(ev.target as HTMLTableHeaderCellElement).style.backgroundColor = 'rgba(122,128,122,0.1)'
                    }}
                    onmouseleave={(ev) => {
                      ;(ev.target as HTMLTableHeaderCellElement).style.backgroundColor = '#333'
                    }}>
                    {props.headerComponents?.[column]?.(column, state) ||
                      props.headerComponents?.default?.(column, state) || (
                        <span
                          style={{ display: 'inline-flex', width: '100%', justifyContent: 'center', cursor: 'pointer' }}
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
                          <div>{column}</div>
                          <div style={{ marginLeft: '1em' }}>
                            {getState().order === column ? (getState().orderDirection === 'ASC' ? '⬆' : '⬇') : null}
                          </div>
                        </span>
                      )}{' '}
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
                  boxShadow: '2px 1px 0px rgba(255,255,255,0.07)',
                }}
                onclick={() => {
                  if (getState().focus !== entry) {
                    updateState({ focus: entry })
                    props.onSelectionChange && props.onSelectionChange([entry])
                    props.onFocusChange && props.onFocusChange(entry)
                  }
                }}
                ondblclick={() => props.onDoubleClick?.(entry)}>
                {props.columns.map((column: any) => (
                  <td style={{ padding: '0.5em', ...props.styles?.cell }}>
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
