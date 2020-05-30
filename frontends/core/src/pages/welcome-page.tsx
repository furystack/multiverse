import { Shade, createComponent } from '@furystack/shades'
import { User, Profile, DefaultUserSettings } from '@common/models'
import { Dashboard } from '../components/dashboard'

export const WelcomePage = Shade<{ profile: Profile; currentUser: User }>({
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
    const dashboard = props.profile.userSettings?.dashboard || DefaultUserSettings.dashboard
    return <Dashboard {...dashboard} />
  },
})
