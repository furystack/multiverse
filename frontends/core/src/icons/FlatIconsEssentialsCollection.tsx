import { FlatIconEssentialNames } from '@common/models/dist/common/flaticon-essential-names'
import { createComponent, PartialElement, Shade } from '@furystack/shades'

export const FlatIconsEssentialsCollection = Shade<
  {
    icon: typeof FlatIconEssentialNames[number]
    style?: Partial<CSSStyleDeclaration>
  } & PartialElement<HTMLImageElement>
>({
  shadowDomName: 'multiverse-flat-icons-essentials-collection',
  render: ({ props }) => {
    return <img {...props} src={`/static/${props.icon}`} alt="icon" style={props.style} />
  },
})
