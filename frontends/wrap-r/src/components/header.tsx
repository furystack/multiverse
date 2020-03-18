import { createComponent, RouteLink, Shade, Router } from '@furystack/shades'
import { AppBar } from 'common-components'

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
            routeMatcher={(current, component) => current.pathname === component}
            notFound={() => <div />}
            routes={[
              {
                url: '/profile',
                component: () => <span> - Profile</span>,
              },
            ]}
          />
        </h3>
        {children}
      </AppBar>
    )
  },
})
