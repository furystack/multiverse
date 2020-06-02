import { Shade, createComponent } from '@furystack/shades'
import { auth } from '@common/models'
import { Dashboard } from '../components/dashboard'

export const WelcomePage = Shade<{ profile: auth.Profile; currentUser: auth.User }>({
  shadowDomName: 'welcome-page',
  constructed: async ({ element }) => {
    setTimeout(() => {
      requestAnimationFrame(() => {
        const container = element.children[0] as HTMLElement
        container.style.opacity = '1'
      })
    }, 200)
  },
  render: ({ props }) => {
    const dashboard = props.profile.userSettings?.dashboard || auth.DefaultUserSettings.dashboard
    return <Dashboard {...dashboard} />
  },
})
