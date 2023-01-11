import { Shade, createComponent, LazyLoad, Router, RouteLink } from '@furystack/shades'
import { useAuthApi } from '@common/frontend-utils'
import { auth } from '@common/models'
import { DataGrid, CollectionService } from '@furystack/shades-common-components'
import { isAuthorized } from '@furystack/core'
import { Init } from '../init'
import { GenericErrorPage } from '../generic-error'
import { EditUserPage } from './edit'

export const UsersPage = Shade<{}, { service: CollectionService<auth.User> }>({
  shadowDomName: 'shade-users-page',
  getInitialState: ({ injector }) => {
    const service = new CollectionService<auth.User>({
      defaultSettings: { top: 20, order: { username: 'ASC' } },
      loader: async (findOptions) => {
        const { result } = await useAuthApi(injector)({
          method: 'GET',
          action: '/users',
          query: { findOptions },
        })
        return result
      },
    })
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
                rowComponents={{
                  username: (el) => {
                    return (
                      <div>
                        <RouteLink href={`/users/${encodeURIComponent(el._id)}`}>{el.username}</RouteLink>
                      </div>
                    )
                  },
                }}
                styles={{}}
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
                  if (await isAuthorized(injector, 'user-admin')) {
                    const { result: user } = await useAuthApi(injector)({
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
