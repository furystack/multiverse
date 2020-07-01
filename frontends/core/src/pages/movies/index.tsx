import { Shade, createComponent, Router, LazyLoad } from '@furystack/shades'
import { media } from '@common/models'
import { MediaApiService } from '@common/frontend-utils'
import { Init } from '../init'
import { GenericErrorPage } from '../generic-error'
import { LibraryList } from './library-list'
import { NewMovieLibrary } from './new-movie-library'
import { MovieList } from './movie-list'
import { Watch } from './watch'
import { EditMovie } from './edit-movie'
import { EncodingTasks } from './encoding-tasks'

export const MoviesPage = Shade({
  shadowDomName: 'multiverse-movies-page',
  render: ({ injector }) => {
    return (
      <Router
        notFound={() => <GenericErrorPage />}
        routes={[
          {
            url: '/movies/:libraryId/edit/:movieId',
            component: ({ match }) => (
              <LazyLoad
                error={(error, retry) => (
                  <GenericErrorPage
                    mainTitle="Cannot load movie for editing..."
                    subtitle="Something bad happened. Are you sure you have the right permission?"
                    error={error}
                    retry={retry}
                  />
                )}
                loader={<Init message="Loading Movie..." />}
                component={async () => {
                  const movie: media.Movie = await injector.getInstance(MediaApiService).call({
                    method: 'GET',
                    action: '/movies/:id',
                    url: { id: match.params.movieId },
                  })
                  return <EditMovie movie={movie} />
                }}
              />
            ),
          },
          { url: '/movies/add-new-movie-library', component: () => <NewMovieLibrary /> },
          {
            url: '/movies/encoding-tasks',
            component: () => (
              <LazyLoad
                loader={<Init message="Getting encoding tasks..." />}
                error={(error, retry) => <GenericErrorPage error={error} retry={retry} />}
                component={async () => {
                  if (await injector.isAuthorized('movie-admin')) {
                    return <EncodingTasks />
                  }
                  return (
                    <GenericErrorPage
                      mainTitle="You cannot pass"
                      subtitle="The role 'movie-admin' is needed to enter this realm"
                    />
                  )
                }}
              />
            ),
          },
          {
            url: '/movies',
            routingOptions: {
              end: true,
            },
            component: () => (
              <LazyLoad
                error={(error, retry) => (
                  <GenericErrorPage
                    subtitle="Something bad happened during loading the libraries"
                    error={error}
                    retry={retry}
                  />
                )}
                loader={<Init message="Loading Libraries..." />}
                component={async () => {
                  const libs = await injector.getInstance(MediaApiService).call({
                    method: 'GET',
                    action: '/movie-libraries',
                    query: { findOptions: { order: { name: 'ASC' } } },
                  })
                  const isMovieAdmin = await injector.isAuthorized('movie-admin')
                  return <LibraryList libraries={libs.entries as media.MovieLibrary[]} isMovieAdmin={isMovieAdmin} />
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
                  error={(error, retry) => (
                    <GenericErrorPage
                      subtitle="Something bad happened during loading the movie list"
                      error={error}
                      retry={retry}
                    />
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
                error={(error, retry) => (
                  <GenericErrorPage
                    subtitle="Something bad happened during loading the movie metadata"
                    error={error}
                    retry={retry}
                  />
                )}
                loader={<Init message="Loading movie..." />}
                component={async () => {
                  const movie = await injector.getInstance(MediaApiService).call({
                    method: 'GET',
                    action: '/movies/:id',
                    url: { id: match.params.movieId },
                  })
                  const movieProgress = await injector.getInstance(MediaApiService).call({
                    method: 'GET',
                    action: '/my-watch-progress',
                    query: {
                      findOptions: {
                        filter: { movieId: { $eq: match.params.movieId }, completed: { $eq: false } },
                        order: { lastWatchDate: 'DESC' },
                      },
                    },
                  })

                  return (
                    <Watch
                      watchedSeconds={movieProgress.entries[0] ? movieProgress.entries[0].watchedSeconds : 0}
                      movie={movie as media.Movie}
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
