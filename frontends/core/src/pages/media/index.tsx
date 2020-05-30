import { Shade, createComponent, Router, LazyLoad } from '@furystack/shades'
import { media } from '@common/models'
import { MediaApiService } from '@common/frontend-utils'
import { Init } from '../init'
import { LibraryList } from './library-list'
import { NewMovieLibrary } from './new-movie-library'

export const MediaPage = Shade({
  shadowDomName: 'multiverse-media-page',
  render: ({ injector }) => {
    return (
      <Router
        routes={[
          {
            url: '/media',
            component: () => (
              <LazyLoad
                loader={<Init message="Loading Libraries..." />}
                component={async () => {
                  const libs = await injector.getInstance(MediaApiService).call({
                    method: 'GET',
                    action: '/movie-libraries',
                    query: { findOptions: {} },
                  })
                  return <LibraryList libraries={libs.entries as media.MovieLibrary[]} />
                }}
              />
            ),
          },
          { url: '/media/add-new-movie-library', component: () => <NewMovieLibrary /> },
        ]}
      />
    )
  },
})
