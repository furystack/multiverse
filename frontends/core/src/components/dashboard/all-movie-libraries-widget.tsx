import { Shade, createComponent, LazyLoad } from '@furystack/shades'
import { MediaApiService } from '@common/frontend-utils'
import { Init } from '../../pages'
import { GenericErrorPage } from '../../pages/generic-error'
import { IconUrlWidget } from './icon-url-widget'

export const AllMovieLibrariesWidget = Shade({
  shadowDomName: 'all-movie-libraries-widget',
  render: ({ injector }) => {
    const nothingToShow = <div>You don't have access to any movie libraries.</div>
    return (
      <LazyLoad
        loader={<Init message="Loading Movie Libraries..." />}
        error={(error, retry) => (
          <GenericErrorPage subtitle="Error loading your Movie Libraries" error={error} retry={retry} />
        )}
        component={async () => {
          const mediaApi = injector.getInstance(MediaApiService)
          const { result: libraries } = await mediaApi.call({
            method: 'GET',
            action: '/movie-libraries',
            query: {
              findOptions: {
                order: { name: 'ASC' },
              },
            },
          })

          if (!libraries.entries.length) {
            return nothingToShow
          }

          return (
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                overflow: 'hidden',
                padding: '1em',
              }}
            >
              <div style={{ overflow: 'hidden', maxWidth: '100%' }}>
                <h3>Movie Libraries</h3>
                <div style={{ display: 'flex', overflow: 'auto', scrollSnapType: 'x mandatory' } as any}>
                  {libraries.entries.map((library, index) => (
                    <div style={{ scrollSnapAlign: 'start' } as any}>
                      <IconUrlWidget
                        icon={library.icon}
                        url={`/movies/${library._id}`}
                        index={index}
                        name={library.name}
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )
        }}
      />
    )
  },
})
