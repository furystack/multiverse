import { Shade, createComponent, LocationService, LazyLoad, Router } from '@furystack/shades'
import { AuthApiService } from '@common/frontend-utils'
import { auth } from '@common/models'
import { DataGrid, CollectionService } from '@furystack/shades-common-components'
import { Init } from '../init'
import { GenericErrorPage } from '../generic-error'
import { EditUserPage } from './edit'

export const UsersPage = Shade<{}, { service: CollectionService<auth.User> }>({
  shadowDomName: 'shade-users-page',
  getInitialState: ({ injector }) => {
    const service = new CollectionService<auth.User>(
      async (findOptions) => {
        const { result } = await injector.getInstance(AuthApiService).call({
          method: 'GET',
          action: '/users',
          query: { findOptions },
        })
        return result
      },
      { top: 20, order: { username: 'ASC' } },
    )
    return { service }
  },
  render: ({ getState, injector }) => {
    return (
      <Router
        routes={[
          {
            url: '/users',
            component: () => (
              <DataGrid<auth.User>
                columns={['username', 'roles']}
                service={getState().service}
                headerComponents={{}}
                rowComponents={{}}
                styles={{}}
                onDoubleClick={(entry) => {
                  history.pushState({}, '', `/users/${encodeURIComponent(entry._id)}`)
                  injector.getInstance(LocationService).updateState()
                }}
              />
            ),
          },
          {
            url: '/users/:userId',
            component: ({ match }) => (
              <LazyLoad
                loader={<Init message="Getting User Data..." />}
                error={(error, retry) => <GenericErrorPage error={error} retry={retry} />}
                component={async () => {
                  if (await injector.isAuthorized('user-admin')) {
                    const { result: user } = await injector.getInstance(AuthApiService).call({
                      method: 'GET',
                      action: '/users/:id',
                      url: {
                        id: match.params.userId,
                      },
                      query: {},
                    })
                    return <EditUserPage entry={user as auth.User} />
                  }
                  return (
                    <GenericErrorPage
                      mainTitle="You cannot pass"
                      subtitle="The role 'user-admin' is needed to enter this realm"
                    />
                  )
                }}
              />
            ),
          },
        ]}
      />
    )
  },
})
