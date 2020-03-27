import { createComponent, RouteLink, Shade, Router } from '@furystack/shades'
import { AppBar, animations } from 'common-components'
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
            routes={[
              {
                url: '/profile',
                component: () => <span style={{ display: 'inline-block' }}> - Profile</span>,
                onVisit: animations.showSlide,
                onLeave: animations.hideSlide,
              },
              {
                url: '/sys-logs/:_id?',
                component: () => <span style={{ display: 'inline-block' }}> - System Logs</span>,
                onVisit: animations.showSlide,
                onLeave: animations.hideSlide,
              },
            ]}
          />
        </h3>
        {children}
      </AppBar>
    )
  },
})
