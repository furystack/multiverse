import { SessionService } from '../services/session'
import { Shade, createComponent } from '@furystack/shades'
import { Button } from 'common-components'

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
        transition:
          'opacity .35s cubic-bezier(0.550, 0.085, 0.680, 0.530), padding .2s cubic-bezier(0.550, 0.085, 0.680, 0.530)',
      }}>
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
        <h2> Hello, {getState().userName || 'unknown'} !</h2>
      </div>
      <Button
        onclick={() => {
          injector.getInstance(SessionService).logout()
        }}>
        Log out
      </Button>
    </div>
  ),
})
