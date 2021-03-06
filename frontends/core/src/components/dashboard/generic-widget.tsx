import { dashboard } from '@common/models'
import { Shade, createComponent } from '@furystack/shades'
import { AppShortcutWidget } from './app-shortcut-widget'
import { ContinueMoviesWidget } from './continue-movies'
import { IconUrlWidget } from './icon-url-widget'
import { BrokenWidget } from './broken-widget'
import { HtmlWidget } from './html-widget'
import { MarkdownWidget } from './markdown-widget'
import { AppListWidget } from './app-list-widget'
import { EntityShortcutWidget } from './entity-shortcut-widget'
import { WeatherWidget } from './weather-widget'

export const GenericWidget = Shade<dashboard.Widget & { index: number }>({
  shadowDomName: 'generic-widget',
  render: ({ props, element }) => {
    Object.assign(element.style, {
      minWidth: props.minWidth,
      maxWidth: props.maxWidth || '100%',
      width: props.width,
      flexGrow: '1',
    })
    switch (props.type) {
      case 'icon-url-widget':
        return <IconUrlWidget {...props} />
      case 'app-shortcut':
        return <AppShortcutWidget {...props} />
      case 'app-list':
        return <AppListWidget {...props} />
      case 'continue-movies':
        return <ContinueMoviesWidget {...props} />
      case 'html':
        return <HtmlWidget {...props} />
      case 'markdown':
        return <MarkdownWidget {...props} />
      case 'entity-shortcut':
        return <EntityShortcutWidget {...props} />
      case 'weather':
        return <WeatherWidget {...props} />
      default:
        return <BrokenWidget message={`There is no widget with type '${(props as any).type}'`} widgetData={props} />
    }
  },
})
