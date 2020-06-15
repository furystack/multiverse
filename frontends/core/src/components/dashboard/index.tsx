import { Shade, createComponent } from '@furystack/shades'
import { Dashboard as DashboardModel } from '@common/models'
import { styles } from '@furystack/shades-common-components'
import { GenericWidget } from './generic-widget'

export const Dashboard = Shade<DashboardModel>({
  shadowDomName: 'multiverse-dashboard',
  render: ({ props }) => {
    return (
      <div
        style={{
          ...styles.glassBox,
          width: '100%',
          height: '100%',
          display: 'flex',
          flexWrap: 'wrap',
          overflow: 'auto',
        }}>
        {props.widgets.map((w, i) => (
          <GenericWidget {...w} index={i} />
        ))}
      </div>
    )
  },
})
