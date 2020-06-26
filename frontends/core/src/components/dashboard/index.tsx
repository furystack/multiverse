import { Shade, createComponent } from '@furystack/shades'
import { dashboard } from '@common/models'
import { styles } from '@furystack/shades-common-components'
import { GenericWidget } from './generic-widget'

export const Dashboard = Shade<dashboard.Dashboard>({
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
