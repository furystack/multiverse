import { createComponent, RouteLink, Shade, Router } from '@furystack/shades'
import { AppBar, animations } from 'common-components'
import { serviceList } from 'common-frontend-utils/src'
export const Header = Shade({
  shadowDomName: 'shade-app-header',
  render: ({ children }) => {
    return (
      <AppBar>
        <h3
          style={{
            margin: '0 2em 0 0',
            color: '#aaa',
            textDecoration: 'none',
            fontFamily: '"Lucida Console", Monaco, monospace',
          }}>
          <RouteLink title="🌀 Multiverse" href="/" style={{ marginRight: '1em', cursor: 'pointer' }}>
            🌀 Multiverse
          </RouteLink>
          <Router
            notFound={() => <div />}
            routes={serviceList.map((s) => ({
              url: s.url,
              routingOptions: { end: false },
              onVisit: animations.showSlide,
              onLeave: animations.hideSlide,
              component: () => (
                <RouteLink style={{ display: 'inline-block' }} href={s.url}>
                  - {s.icon} {s.name}
                </RouteLink>
              ),
            }))}
          />
        </h3>
        {children}
      </AppBar>
    )
  },
})
