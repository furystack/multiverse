import { Shade, createComponent, LazyLoad } from '@furystack/shades'
import { auth, dashboard } from '@common/models'
import { DashboardApiService } from '@common/frontend-utils'
import { Dashboard } from '../components/dashboard'
import { GenericErrorPage } from './generic-error'
import { Init } from '.'

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
  render: ({ props, injector }) => {
    return (
      <LazyLoad
        error={(error, retry) => (
          <GenericErrorPage
            subtitle="Something bad happened during loading the dashboard"
            error={error}
            retry={retry}
          />
        )}
        component={async () => {
          const dashboardId = props.profile?.userSettings?.dashboardId
          if (dashboardId) {
            const entry: dashboard.Dashboard = await injector.getInstance(DashboardApiService).call({
              method: 'GET',
              action: '/boards/:id',
              url: { id: dashboardId },
            })
            return <Dashboard {...entry} />
          }
          return <Dashboard {...dashboard.defaultDashboard} />
        }}
        loader={<Init message="Loading Dashboard..." />}
      />
    )
  },
})
