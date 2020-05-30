import { Shade, RouteLink, createComponent } from '@furystack/shades'
import { promisifyAnimation } from '@furystack/shades-common-components'
import { IconUrlWidget as IconUrlWidgetModel } from '@common/models'

export const IconUrlWidget = Shade<Omit<IconUrlWidgetModel, 'type'> & { index: number }>({
  shadowDomName: 'icon-url-widget',
  render: ({ props, element }) => {
    setTimeout(() => {
      promisifyAnimation(element.querySelector('a'), [{ transform: 'scale(0)' }, { transform: 'scale(1)' }], {
        fill: 'forwards',
        delay: 500 + (props.index || Math.random() * 10) * 100,
        duration: 200,
      })
    })

    return (
      <RouteLink
        title={props.description}
        onmouseenter={(ev) =>
          promisifyAnimation(
            ev.target as any,
            [{ filter: 'saturate(0.3)brightness(0.6)' }, { filter: 'saturate(1)brightness(1)' }],
            {
              duration: 500,
              fill: 'forwards',
              easing: 'cubic-bezier(0.230, 1.000, 0.320, 1.000)',
            },
          )
        }
        onmouseleave={(ev) =>
          promisifyAnimation(
            ev.target as any,
            [{ filter: 'saturate(1)brightness(1)' }, { filter: 'saturate(0.3)brightness(0.6)' }],
            {
              duration: 500,
              fill: 'forwards',
              easing: 'cubic-bezier(0.230, 1.000, 0.320, 1.000)',
            },
          )
        }
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          flexDirection: 'column',
          width: '256px',
          height: '256px',
          filter: 'saturate(0.3)brightness(0.6)',
          background: 'rgba(128,128,128,0.1)',
          transform: 'scale(0)',
          borderRadius: '8px',
        }}
        href={props.url}>
        <div
          onclick={(ev) => {
            if (props.url.startsWith('http') && new URL(props.url).href !== window.location.href) {
              ev.preventDefault()
              ev.stopImmediatePropagation()
              window.location.replace(props.url)
            }
          }}>
          <div style={{ fontSize: '128px' }}>{props.icon}</div>
          <div>{props.name}</div>
        </div>
      </RouteLink>
    )
  },
})
