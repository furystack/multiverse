import { SearchOptions } from '@furystack/core'
import { ChildrenList, Shade, createComponent } from '@furystack/shades'
import { CollectionService } from '@common/frontend-utils/src'
import { animations } from '../animations'

export interface DataGridHeaderProps<T, K extends keyof T> {
  collectionService: CollectionService<T>
  field: K
}

export interface DataGridHeaderState<T> {
  querySettings: SearchOptions<T, any>
}

export const DataGridHeader: <T, K extends keyof T>(
  props: DataGridHeaderProps<T, K>,
  children: ChildrenList,
) => JSX.Element<any, any> = Shade<DataGridHeaderProps<any, any>, DataGridHeaderState<any>>({
  shadowDomName: 'data-grid-header',
  getInitialState: ({ props }) => ({
    querySettings: props.collectionService.querySettings.getValue(),
  }),
  constructed: ({ props, updateState }) => {
    const disposable = props.collectionService.querySettings.subscribe((querySettings) =>
      updateState({ querySettings }),
    )
    return () => disposable.dispose()
  },
  render: ({ getState, props, element }) => {
    const currentState = getState()
    const currentOrder = Object.keys(currentState.querySettings.order || {})[0]
    const currentOrderDirection = Object.values(currentState.querySettings.order || {})[0]
    const getControlsElement = () => element.querySelector('.header-controls') as HTMLDivElement
    return (
      <div
        onmouseenter={() => {
          animations.fadeIn(getControlsElement())
        }}
        onmouseleave={() => {
          animations.fadeOut(getControlsElement())
        }}
        style={{ display: 'flex', width: '100%', height: '100%', justifyContent: 'space-evenly' }}>
        <div>{props.field}</div>
        <div
          className="header-controls"
          style={{ opacity: '0', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <div
            title="Change order"
            style={{ padding: '0 1em', cursor: 'pointer' }}
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
            {currentOrder === props.field && currentOrderDirection === 'ASC' ? '⬇' : '⬆'}
          </div>
          <div style={{ cursor: 'pointer' }} title="Search">
            🔍
          </div>
        </div>
      </div>
    )
  },
})
