import type { common } from '@common/models'
import type { PartialElement } from '@furystack/shades'
import { createComponent, Shade } from '@furystack/shades'

export const FlatIconsEssentialsCollection = Shade<
  {
    icon: (typeof common.FlatIconEssentialNames)[number]
    style?: Partial<CSSStyleDeclaration>
  } & PartialElement<HTMLImageElement>
>({
  shadowDomName: 'multiverse-flat-icons-essentials-collection',
  render: ({ props }) => {
    return <img {...props} src={`/static/${props.icon}`} alt="icon" style={props.style} />
  },
})
