import { createComponent, RouteLink, Shade } from '@furystack/shades'
import { AppBar } from 'common-components'

const urlStyle: Partial<CSSStyleDeclaration> = {
  color: '#aaa',
  textDecoration: 'none',
}

export const Header = Shade({
  shadowDomName: 'shade-app-header',
  render: ({ children }) => {
    return (
      <AppBar>
        <h3 style={{ margin: '0 2em 0 0', cursor: 'pointer' }}>
          <RouteLink title="🌀 Multiverse" href="/" style={urlStyle}>
            🌀 Multiverse
          </RouteLink>
        </h3>
        {children}
      </AppBar>
    )
  },
})
