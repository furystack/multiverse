export interface WidgetBase<T extends string> {
  type: T
  minWidth?: string
  width?: string
  maxWidth?: string
}
