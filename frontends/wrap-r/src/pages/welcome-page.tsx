import { Shade, createComponent } from '@furystack/shades'
import { Button, styles } from 'common-components'
import { SessionService } from 'common-frontend-utils'

export const WelcomePage = Shade({
  shadowDomName: 'welcome-page',
  initialState: {
    userName: '',
  },
  constructed: async ({ injector, updateState, element }) => {
    const observable = injector.getInstance(SessionService).currentUser.subscribe(usr => {
      updateState({ userName: usr ? usr.username : '' })
    }, true)
    setTimeout(() => {
      requestAnimationFrame(() => {
        const container = element.children[0] as HTMLElement
        container.style.opacity = '1'
      })
    }, 200)
    return () => observable.dispose()
  },
  render: ({ injector, getState }) => (
    <div
      style={{
        opacity: '0',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
        height: '100%',
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
        }}>
        <h2> Hello, {getState().userName || 'unknown'} !</h2>
        <p>Welcome to FuryStack multiverse, have fun!</p>
        <Button
          onclick={() => {
            injector.getInstance(SessionService).logout()
          }}>
          Log out
        </Button>
      </div>
    </div>
  ),
})
