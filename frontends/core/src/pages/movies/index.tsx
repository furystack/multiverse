import { Shade, createComponent, Router, LazyLoad } from '@furystack/shades'
import { media } from '@common/models'
import { MediaApiService } from '@common/frontend-utils'
import { Init } from '../init'
import { GenericErrorPage } from '../generic-error'
import { LibraryList } from './library-list'
import { NewMovieLibrary } from './new-movie-library'
import { MovieList } from './movie-list'
import { Watch } from './watch'

export const MoviesPage = Shade({
  shadowDomName: 'multiverse-movies-page',
  render: ({ injector }) => {
    return (
      <Router
        routes={[
          { url: '/movies/add-new-movie-library', component: () => <NewMovieLibrary /> },

          {
            url: '/movies',
            routingOptions: {
              end: true,
            },
            component: () => (
              <LazyLoad
                error={(error) => (
                  <GenericErrorPage subtitle="Something bad happened during loading the libraries" error={error} />
                )}
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
          {
            url: '/movies/:libraryId',
            routingOptions: {
              end: true,
            },
            component: ({ match }) => {
              return (
                <LazyLoad
                  error={(error) => (
                    <GenericErrorPage subtitle="Something bad happened during loading the movie list" error={error} />
                  )}
                  loader={<Init message="Loading movies..." />}
                  component={async () => {
                    const movies = await injector.getInstance(MediaApiService).call({
                      method: 'GET',
                      action: '/movies',
                      query: { findOptions: { filter: { libraryId: { $eq: match.params.libraryId } } } },
                    })
                    return <MovieList movies={movies.entries as media.Movie[]} />
                  }}
                />
              )
            },
          },
          {
            url: '/movies/watch/:movieId',
            component: ({ match }) => (
              <LazyLoad
                error={(error) => (
                  <GenericErrorPage subtitle="Something bad happened during loading the movie metadata" error={error} />
                )}
                loader={<Init message="Loading movie..." />}
                component={async () => {
                  const movie = await injector.getInstance(MediaApiService).call({
                    method: 'GET',
                    action: '/movies/:id',
                    url: { id: match.params.movieId },
                  })
                  return <Watch movie={movie as media.Movie} />
                }}
              />
            ),
          },
        ]}
      />
    )
  },
})
