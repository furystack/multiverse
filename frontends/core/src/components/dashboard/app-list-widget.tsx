import { Shade, createComponent } from '@furystack/shades'
import { dashboard } from '@common/models'
import { AppShortcutWidget } from './app-shortcut-widget'

export const AppListWidget = Shade<dashboard.AppListWidget>({
  shadowDomName: 'multiverse-app-list-widget',
  render: ({ props }) => {
    return (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          overflow: 'hidden',
          padding: '1em',
        }}>
        <div style={{ overflow: 'hidden', maxWidth: '100%' }}>
          <h3>{props.title}</h3>
          <div style={{ display: 'flex', overflow: 'auto', scrollSnapType: 'x mandatory' } as any}>
            {props.apps.map((app, index) => (
              <div style={{ scrollSnapAlign: 'start' } as any}>
                <AppShortcutWidget appName={app} index={index} type="app-shortcut" />
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  },
})
