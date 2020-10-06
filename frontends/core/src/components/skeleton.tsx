import { createComponent, PartialElement, Shade } from '@furystack/shades'
import large from '../animations/loading-skeleton-large.json'
import list from '../animations/loading-skeleton-list.json'
import twoRows from '../animations/loading-skeleton-two-rows.json'

export const Skeleton = Shade<{ variant: 'large' | 'list' | 'two-rows' } & PartialElement<HTMLElement>>({
  render: ({ props }) => {
    const src =
      props.variant === 'large'
        ? JSON.stringify(large)
        : props.variant === 'list'
        ? JSON.stringify(list)
        : JSON.stringify(twoRows)
    return <lottie-player autoplay loop src={src} />
  },
})
