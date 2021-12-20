import { Injector } from '@furystack/inject'
import { SessionService, SessionState } from '@common/frontend-utils'
import { createComponent, Shade } from '@furystack/shades'
import { defaultLightTheme, Loader, NotyList, ThemeProviderService } from '@furystack/shades-common-components'
import { Layout } from './components/layout'
import { Login } from './pages'

const lightBackground = 'linear-gradient(to right bottom, #ebebf8, #e3e3f6, #dcdcf4, #d4d4f2, #cdcdf0)'
const darkBackground = 'linear-gradient(to right bottom, #2b3036, #292c31, #27282d, #242428, #212023)'

const getStyles = (injector: Injector): Partial<CSSStyleDeclaration> => {
  const themeProvider = injector.getInstance(ThemeProviderService)
  const isLight = themeProvider.theme.getValue() === defaultLightTheme
  const backgroundImage = isLight ? lightBackground : darkBackground
  const color = themeProvider.getTextColor(themeProvider.theme.getValue().background.paper)
  return {
    backgroundImage,
    color,
  }
}

export const MultiverseApp = Shade<{}, { sessionState: SessionState }>({
  shadowDomName: 'furystack-multiverse-app',
  getInitialState: () => ({ sessionState: 'initializing' }),
  resources: ({ injector, updateState, element }) => {
    const sessionService = injector.getInstance(SessionService)
    return [
      sessionService.state.subscribe((sessionState) => updateState({ sessionState })),
      injector.getInstance(ThemeProviderService).theme.subscribe(() => {
        const styles = getStyles(injector)
        Object.assign((element.querySelector('div') as HTMLDivElement).style, styles)
      }, true),
    ]
  },
  render: ({ getState, injector }) => {
    const { sessionState } = getState()

    const Component = () => {
      switch (sessionState) {
        case 'authenticated':
          return <Layout />
        case 'unauthenticated':
          return <Login style={{ height: '100%' }} />
        default:
          return <Loader />
      }
    }

    return (
      <div
        id="Layout"
        style={{
          ...getStyles(injector),
          position: 'fixed',
          top: '0',
          left: '0',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          fontFamily: 'Arial, Helvetica, sans-serif',
          lineHeight: '1.6',
        }}
        className="eee">
        {Component()}
        <NotyList />
      </div>
    )
  },
})
