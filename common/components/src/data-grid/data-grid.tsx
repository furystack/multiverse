import { ChildrenList, createComponent, Shade, PartialElement } from '@furystack/shades'
import { CollectionService, CollectionData } from '@common/frontend-utils'
import { GridProps } from '../grid'
import { colors } from '../styles'
import { DataGridHeader } from './header'

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

export const dataGridItemsPerPage = [10, 20, 25, 50, 100]

export interface DataGridState<T> {
  data: CollectionData<T>
  isLoading: boolean
  selection: T[]
  focus?: T
  error?: Error
}

export const DataGrid: <T>(props: DataGridProps<T>, children: ChildrenList) => JSX.Element<any, any> = Shade<
  DataGridProps<any>,
  DataGridState<any>
>({
  shadowDomName: 'shade-data-grid',
  getInitialState: () =>
    ({
      data: { count: 0, entries: [] },
      itemsPerPage: 10,
      isLoading: false,
      selection: [],
    } as DataGridState<any>),
  constructed: ({ props, updateState }) => {
    const subscriptions = [
      props.service.data.subscribe((data) => updateState({ data })),
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

    const currentQuerySettings = props.service.querySettings.getValue()
    const currentPage = Math.ceil(currentQuerySettings.skip || 0) / (currentQuerySettings.top || 1)

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
        <table style={{ width: '100%', height: '100%', position: 'relative' }}>
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
                        <DataGridHeader<any, typeof column> field={column} collectionService={props.service} />
                      )}
                  </th>
                )
              })}
            </tr>
          </thead>
          <tbody>
            {state.data.entries.map((entry) => (
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
        <div
          className="pager"
          style={{
            background: '#333',
            position: 'sticky',
            bottom: '0',
            display: 'flex',
            justifyContent: 'flex-end',
            padding: '1em',
            alignItems: 'center',
          }}>
          <div>
            Goto page
            <select
              style={{ margin: '0 1em' }}
              onchange={(ev) => {
                const value = parseInt((ev.target as any).value, 10)
                const currentQuery = props.service.querySettings.getValue()
                props.service.querySettings.setValue({ ...currentQuery, skip: (currentQuery.top || 0) * value })
              }}>
              {[
                ...new Array(Math.ceil(state.data.count / (props.service.querySettings.getValue().top || Infinity))),
              ].map((_val, index) => (
                <option value={index.toString()} selected={currentPage === index}>
                  {(index + 1).toString()}
                </option>
              ))}
            </select>
          </div>
          <div>
            {' '}
            Show
            <select
              style={{ margin: '0 1em' }}
              onchange={(ev) => {
                const value = parseInt((ev.currentTarget as any).value as string, 10)
                props.service.querySettings.setValue({
                  ...currentQuerySettings,
                  top: value,
                  skip: currentPage * value,
                })
              }}>
              {dataGridItemsPerPage.map((no) => (
                <option value={no.toString()} selected={no === currentQuerySettings.top}>
                  {no.toString()}
                </option>
              ))}
            </select>
            items per page
          </div>
        </div>
      </div>
    )
  },
})
