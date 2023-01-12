import { Shade, createComponent, LazyLoad } from '@furystack/shades'
import type { auth } from '@common/models'
import { dashboard } from '@common/models'
import { useDashboardApi } from '@common/frontend-utils'
import { Dashboard } from '../components/dashboard'
import { GenericErrorPage } from './generic-error'
import { Init } from '.'

export const WelcomePage = Shade<{ profile: auth.Profile }>({
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
            const { result: entry } = await useDashboardApi(injector)({
              method: 'GET',
              action: '/boards/:id',
              url: { id: dashboardId },
              query: {},
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
