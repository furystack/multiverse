import { Shade, Router, createComponent, LazyLoad } from '@furystack/shades'

import { DashboardApiService } from '@common/frontend-utils'
import { GenericErrorPage } from '../generic-error'
import { Init } from '../init'
import { Dashboard } from '../../components/dashboard'
import { DashboardList } from './dashboard-list'
import { CreateDashboard } from './create-dashboard'
import { EditDashboard } from './edit-dashboard'

export const DashboardsPage = Shade({
  shadowDomName: 'multiverse-dashboards-page',
  render: ({ injector }) => {
    return (
      <Router
        routes={[
          {
            url: '/dashboard/list',
            component: () => <DashboardList />,
          },
          {
            url: '/dashboard/new',
            component: () => <CreateDashboard />,
          },
          {
            url: '/dashboard/edit/:dashboardId',
            component: ({ match }) => (
              <LazyLoad
                error={(error, retry) => (
                  <GenericErrorPage
                    subtitle="Something bad happened during loading the patch details"
                    error={error}
                    retry={retry}
                  />
                )}
                component={async () => {
                  const { dashboardId } = match.params
                  const { result } = await injector.getInstance(DashboardApiService).call({
                    method: 'GET',
                    action: '/boards/:id',
                    url: { id: dashboardId },
                    query: {},
                  })
                  return <EditDashboard dashboard={result} />
                }}
                loader={<Init message="Loading Dashboard to edit..." />}
              />
            ),
          },
          {
            url: '/dashboard/view/:dashboardId',
            component: ({ match }) => (
              <LazyLoad
                error={(error, retry) => (
                  <GenericErrorPage
                    subtitle="Something bad happened during loading the dashboard details"
                    error={error}
                    retry={retry}
                  />
                )}
                component={async () => {
                  const { dashboardId } = match.params
                  const { result } = await injector.getInstance(DashboardApiService).call({
                    method: 'GET',
                    action: '/boards/:id',
                    url: { id: dashboardId },
                    query: {},
                  })
                  return <Dashboard {...result} />
                }}
                loader={<Init message="Loading Dashboard..." />}
              />
            ),
          },
        ]}
      />
    )
  },
})
