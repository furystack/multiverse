import { Shade, createComponent } from '@furystack/shades'
import { IconUrlWidget } from './icon-url-widget'

export const BrokenWidget = Shade<{ widgetData: any; message: string }>({
  shadowDomName: 'broken-widget',
  render: ({ props }) => {
    return <IconUrlWidget name={'Broken'} description={props.message} icon={'😔'} url={''} index={0} />
  },
})
