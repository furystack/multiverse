import { createComponent, Shade } from '@furystack/shades'
import { ThemeProviderService } from '@furystack/shades-common-components'
import { ThemeService } from '@common/frontend-utils'
import { Body } from './body'
import { Header } from './header'

export const Layout = Shade({
  shadowDomName: 'shade-app-layout',
  render: ({ injector }) => {
    const themeService = injector.getInstance(ThemeService)
    const themeProvider = injector.getInstance(ThemeProviderService)
    return (
      <div
        id="Layout"
        style={{
          position: 'fixed',
          top: '0',
          left: '0',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          fontFamily: 'Arial, Helvetica, sans-serif',
          lineHeight: '1.6',
          background: themeService.getBackground(),
          color: themeProvider.theme.text.secondary,
        }}
        className="eee"
      >
        <Header />
        <Body />
      </div>
    )
  },
})
