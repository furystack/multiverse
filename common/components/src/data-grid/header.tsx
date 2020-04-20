import { SearchOptions } from '@furystack/core'
import { ChildrenList, Shade, createComponent } from '@furystack/shades'
import { CollectionService } from '@common/frontend-utils/src'

export interface DataGridHeaderProps<T, K extends keyof T> {
  collectionService: CollectionService<T>
  field: K
}

export interface DataGridHeaderState<T> {
  hovered: boolean
  querySettings: SearchOptions<T, any>
}

export const DataGridHeader: <T, K extends keyof T>(
  props: DataGridHeaderProps<T, K>,
  children: ChildrenList,
) => JSX.Element<any, any> = Shade<DataGridHeaderProps<any, any>, DataGridHeaderState<any>>({
  shadowDomName: 'data-grid-header',
  getInitialState: ({ props }) => ({
    hovered: false,
    querySettings: props.collectionService.querySettings.getValue(),
  }),
  constructed: ({ props, updateState }) => {
    const disposable = props.collectionService.querySettings.subscribe((querySettings) =>
      updateState({ querySettings }),
    )
    return () => disposable.dispose()
  },
  render: ({ getState, props }) => {
    const currentState = getState()
    const currentOrder = Object.keys(currentState.querySettings.order || {})[0]
    const currentOrderDirection = Object.values(currentState.querySettings.order || {})[0]
    return (
      <span
        style={{ display: 'inline-flex', width: '100%', justifyContent: 'center', cursor: 'pointer' }}
        onclick={() => {
          let newDirection: 'ASC' | 'DESC' = 'ASC'
          const newOrder: { [K in keyof any]: 'ASC' | 'DESC' } = {}

          if (currentOrder === props.field) {
            newDirection = currentOrderDirection === 'ASC' ? 'DESC' : 'ASC'
          }
          newOrder[props.field] = newDirection
          props.collectionService.querySettings.setValue({
            ...currentState.querySettings,
            order: newOrder,
          })
        }}>
        <div>{props.field}</div>
        <div style={{ marginLeft: '1em' }}>
          {currentOrder === props.field ? (currentOrderDirection === 'ASC' ? '⬆' : '⬇') : null}
        </div>
      </span>
    )
  },
})
