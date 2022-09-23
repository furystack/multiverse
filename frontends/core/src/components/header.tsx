import { createComponent, RouteLink, Shade, ScreenService, Router } from '@furystack/shades'

import { AppBar, CommandPalette, showSlide, hideSlide } from '@furystack/shades-common-components'
import { serviceList } from '@common/models'
import { getCommandProviders } from '../services/command-providers'
import { Icon } from './icon'
import { CurrentUserMenu } from './current-user-menu'
export const Header = Shade<unknown, { isDesktop: boolean }>({
  getInitialState: ({ injector }) => ({
    isDesktop: injector.getInstance(ScreenService).screenSize.atLeast.md.getValue(),
  }),
  shadowDomName: 'shade-app-header',
  constructed: ({ injector, updateState }) => {
    const isDesktopObserver = injector
      .getInstance(ScreenService)
      .screenSize.atLeast.md.subscribe((val) => updateState({ isDesktop: val }))
    return () => isDesktopObserver.dispose()
  },
  render: ({ getState }) => {
    const { isDesktop } = getState()
    if (!isDesktop) {
      return (
        <AppBar>
          <RouteLink
            title="Multiverse"
            href="/"
            style={{
              marginRight: '1em',
              cursor: 'pointer',
              placeContent: 'center',
              display: 'flex',
              overflow: 'hidden',
              flexShrink: '1',
              textOverflow: 'hidden',
            }}
          >
            <img src="/static/galaxy.png" alt="Multiverse Logo" style={{ marginRight: '0.5em', flexGrow: '0' }} />
          </RouteLink>
          <CommandPalette
            style={{ marginRight: '0.5em' }}
            commandProviders={getCommandProviders()}
            fullScreenSuggestions={true}
            defaultPrefix={'>'}
          />
          <CurrentUserMenu isDesktop={isDesktop} />
          <div style={{ width: '30px' }} />
        </AppBar>
      )
    }
    return (
      <AppBar>
        <h3
          style={{
            margin: '0 2em 0 0',
            textDecoration: 'none',
            fontFamily: '"Lucida Console", Monaco, monospace',
            whiteSpace: 'nowrap',
            textOverflow: 'ellipsis',
            display: 'flex',
            lineHeight: '50px',
          }}
        >
          <RouteLink
            title="Multiverse"
            href="/"
            style={{
              marginRight: '1em',
              cursor: 'pointer',
              placeContent: 'center',
              display: 'flex',
              overflow: 'hidden',
              flexShrink: '1',
              textOverflow: 'hidden',
            }}
          >
            <img src="/static/galaxy.png" alt="Multiverse Logo" style={{ marginRight: '1em' }} />
            <div style={{ overflow: 'hidden', textOverflow: 'ellipsos' }}>Multiverse</div>
          </RouteLink>
          <Router
            notFound={() => <div />}
            routes={serviceList.map((s) => ({
              url: s.url,
              routingOptions: { end: false },
              onVisit: async ({ element }) => {
                await showSlide(element)
              },
              onLeave: async ({ element }) => {
                await hideSlide(element)
              },
              component: () => (
                <RouteLink style={{ display: 'inline-flex' }} href={s.url}>
                  -{' '}
                  <Icon icon={s.icon} elementProps={{ style: { height: '100%', margin: '0px 13px', width: '28px' } }} />
                  {s.name}
                </RouteLink>
              ),
            }))}
          />
        </h3>
        <CommandPalette
          style={{ marginRight: '1em' }}
          commandProviders={getCommandProviders()}
          defaultPrefix={'>'}
          fullScreenSuggestions={false}
        />
        <CurrentUserMenu isDesktop={isDesktop} />
        <div style={{ width: '50px' }} />
      </AppBar>
    )
  },
})
