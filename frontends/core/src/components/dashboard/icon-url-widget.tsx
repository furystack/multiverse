import { Shade, RouteLink, createComponent } from '@furystack/shades'
import { promisifyAnimation } from '@furystack/shades-common-components'
import { dashboard } from '@common/models'
import { Icon } from '../icon'

const focus = (el: HTMLElement) => {
  promisifyAnimation(
    el,
    [
      { opacity: '.5', boxShadow: '1px 3px 6px rgba(0,0,0,0.3)' },
      { opacity: '1', boxShadow: '0px 1px 2px rgba(0,0,0,0.3)' },
    ],
    {
      duration: 1000,
      fill: 'forwards',
      easing: 'cubic-bezier(0.230, 1.000, 0.320, 1.000)',
    },
  )
}

const blur = (el: HTMLElement) => {
  promisifyAnimation(
    el,
    [
      { opacity: '1', boxShadow: '0px 1px 2px rgba(0,0,0,0.3)' },
      { opacity: '.5', boxShadow: '1px 3px 6px rgba(0,0,0,0.3)' },
    ],
    {
      duration: 1200,
      fill: 'forwards',
      easing: 'cubic-bezier(0.230, 1.000, 0.320, 1.000)',
    },
  )
}

export const IconUrlWidget = Shade<Omit<dashboard.IconUrlWidget, 'type'> & { index: number }>({
  shadowDomName: 'icon-url-widget',
  render: ({ props, element }) => {
    setTimeout(() => {
      promisifyAnimation(
        element.querySelector('route-link div'),
        [{ transform: 'scale(0)' }, { transform: 'scale(1)' }],
        {
          fill: 'forwards',
          delay: 500 + (props.index === undefined ? Math.random() * 10 : props.index) * 100,
          duration: 200,
        },
      )
    })

    return (
      <RouteLink title={props.description} href={props.url}>
        <div
          onmouseenter={(ev) => focus(ev.target as HTMLElement)}
          onfocus={(ev) => focus(ev.target as HTMLElement)}
          onmouseleave={(ev) => blur(ev.target as HTMLElement)}
          onblur={(ev) => blur(ev.target as HTMLElement)}
          style={{
            width: '256px',
            height: '256px',
            margin: '8px',
            borderRadius: '8px',
            transform: 'scale(.05)',
            overflow: 'hidden',
            placeContent: 'center',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-evenly',
            boxShadow: '1px 3px 6px rgba(0,0,0,0.3)',
            background: 'rgba(128,128,128,0.15)',
            opacity: '.5',
          }}
          onclick={(ev) => {
            if (props.url.startsWith('http') && new URL(props.url).href !== window.location.href) {
              ev.preventDefault()
              ev.stopImmediatePropagation()
              window.location.replace(props.url)
            }
          }}>
          <Icon
            icon={props.icon}
            elementProps={{
              style: {
                height: '128px',
                fontSize: '96px',
                lineHeight: '128px',
                display: 'block',
                width: '100%',
                placeContent: 'center',
                textAlign: 'center',
                filter: 'drop-shadow(2px 4px 9px rgba(0,0,0,0.5))',
              },
            }}
          />
          <div
            style={{
              maxWidth: '100%',
              overflow: 'hidden',
              textAlign: 'center',
              textOverflow: 'ellipsis',
            }}>
            {props.name}
          </div>
        </div>
      </RouteLink>
    )
  },
})
