import { Shade, createComponent, LocationService } from '@furystack/shades'
import { dashboard, auth } from '@common/models'
import { DashboardApiService, AuthApiService } from '@common/frontend-utils'
import { GenericMonacoEditor } from '../../components/editors/generic-monaco-editor'

export const EditDashboard = Shade<{ dashboard: dashboard.Dashboard }>({
  shadowDomName: 'multiverse-edit-dashboard',
  render: ({ props, injector }) => {
    return (
      <GenericMonacoEditor<dashboard.Dashboard, 'dashboardSchema', 'Dashboard'>
        title={`Edit movie "${props.dashboard.name}"`}
        schema="dashboardSchema"
        entity={'Dashboard'}
        data={props.dashboard}
        additionalActions={[
          {
            name: 'View',
            action: async () => {
              history.pushState('', '', `/dashboard/view/${props.dashboard._id}`)
              injector.getInstance(LocationService).updateState()
            },
          },
          {
            name: 'Set as my default',
            action: async () => {
              const currentUser = await injector.getCurrentUser()
              const profile: auth.Profile = await injector.getInstance(AuthApiService).call({
                method: 'GET',
                action: '/profiles/:username',
                url: { username: currentUser.username },
              })
              injector.getInstance(AuthApiService).call({
                method: 'PATCH',
                action: '/profile/:id',
                url: { id: profile._id },
                body: { userSettings: { ...profile.userSettings, dashboardId: props.dashboard._id } },
              })
            },
          },
        ]}
        onSave={async (movie: dashboard.Dashboard) => {
          const { _id, ...body } = movie
          await injector.getInstance(DashboardApiService).call({
            method: 'PATCH',
            action: '/boards/:id',
            url: { id: movie._id },
            body,
          })
        }}
      />
    )
  },
})
