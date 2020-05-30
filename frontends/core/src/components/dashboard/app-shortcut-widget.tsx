import { Shade, createComponent } from '@furystack/shades'
import { AppShortcutWidget as AppShortcutWidgetModel, serviceList } from '@common/models'
import { IconUrlWidget } from './icon-url-widget'
import { BrokenWidget } from './broken-widget'

export const AppShortcutWidget = Shade<AppShortcutWidgetModel & { index: number }>({
  shadowDomName: 'app-shortcut-widget',
  render: ({ props }) => {
    const app = serviceList.find((s) => s.name === props.appName)
    if (!app) {
      return <BrokenWidget message={`App with name '${props.appName}' not found`} widgetData={props} />
    }
    return (
      <IconUrlWidget icon={app.icon} name={app.name} url={app.url} description={app.description} index={props.index} />
    )
  },
})
