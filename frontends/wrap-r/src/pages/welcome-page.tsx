import { Shade, createComponent, RouteLink } from '@furystack/shades'
import { styles } from 'common-components'
import { SessionService, serviceList, promisifyAnimation } from 'common-frontend-utils'
import { User } from 'common-models'

export const Widget = Shade<{ url: string; icon: string; name: string; description: string; index: number }>({
  shadowDomName: 'shade-welcome-screen-widget',
  render: ({ props, element }) => {
    setTimeout(() => {
      promisifyAnimation(element.querySelector('a'), [{ transform: 'scale(0)' }, { transform: 'scale(1)' }], {
        fill: 'forwards',
        delay: 500 + props.index * 100,
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
          transform: 'scale(0)',
        }}
        href={props.url}>
        <div style={{ fontSize: '128px' }}>{props.icon}</div>
        <div>{props.name}</div>
      </RouteLink>
    )
  },
})

export const WelcomePage = Shade<{}, { currentUser: User | null }>({
  shadowDomName: 'welcome-page',
  getInitialState: ({ injector }) => ({
    currentUser: injector.getInstance(SessionService).currentUser.getValue(),
  }),
  constructed: async ({ injector, updateState, element }) => {
    const observable = injector.getInstance(SessionService).currentUser.subscribe((currentUser) => {
      updateState({ currentUser })
    })
    setTimeout(() => {
      requestAnimationFrame(() => {
        const container = element.children[0] as HTMLElement
        container.style.opacity = '1'
      })
    }, 200)
    return () => observable.dispose()
  },
  render: ({ getState }) => (
    <div
      style={{
        opacity: '0',
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'center',
        width: '100%',
        height: '100%',
        overflow: 'auto',
        transition:
          'opacity .35s cubic-bezier(0.550, 0.085, 0.680, 0.530), padding .2s cubic-bezier(0.550, 0.085, 0.680, 0.530)',
      }}>
      <div
        style={{
          ...styles.glassBox,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '2em',
          flexGrow: '1',
        }}>
        <h2 style={{ margin: '0' }}> Welcome, {getState().currentUser?.username || 'unknown'} !</h2>
        <div style={{ display: 'flex', flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center' }}>
          {serviceList
            .filter((service) => service.requiredRoles.every((role) => getState().currentUser?.roles.includes(role)))
            .map((service, index) => (
              <Widget
                name={service.name}
                icon={service.icon}
                description={service.description}
                url={service.url}
                index={index}
              />
            ))}
        </div>
      </div>
    </div>
  ),
})
