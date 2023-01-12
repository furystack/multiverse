import { Shade, createComponent, LocationService } from '@furystack/shades'
import type { dashboard } from '@common/models'
import { useDashboardApi, useAuthApi } from '@common/frontend-utils'
import { getCurrentUser } from '@furystack/core'
import { GenericMonacoEditor } from '../../components/editors/generic-monaco-editor'

export const EditDashboard = Shade<{ dashboard: dashboard.Dashboard }>({
  shadowDomName: 'multiverse-edit-dashboard',
  render: ({ props, injector }) => {
    return (
      <GenericMonacoEditor<dashboard.Dashboard, 'dashboardSchema', 'Dashboard'>
        title={`Edit Dashboard "${props.dashboard.name}"`}
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
              const currentUser = await getCurrentUser(injector)
              const { result: profile } = await useAuthApi(injector)({
                method: 'GET',
                action: '/profiles/:username',
                url: { username: currentUser.username },
              })
              useAuthApi(injector)({
                method: 'PATCH',
                action: '/profiles/:id',
                url: { id: profile._id },
                body: { userSettings: { ...profile.userSettings, dashboardId: props.dashboard._id } },
              })
            },
          },
        ]}
        onSave={async (movie: dashboard.Dashboard) => {
          const { _id, ...body } = movie
          await useDashboardApi(injector)({
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
