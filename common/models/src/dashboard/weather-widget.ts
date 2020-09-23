import { WidgetBase } from './widget-base'

export interface WeatherWidget extends WidgetBase<'weather'> {
  city: string
}
