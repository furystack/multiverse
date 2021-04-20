import { Shade, createComponent, Router, LazyLoad } from '@furystack/shades'
import { media } from '@common/models'
import { MediaApiService } from '@common/frontend-utils'
import { Fab } from '@furystack/shades-common-components'
import { Init } from '../init'
import { GenericErrorPage } from '../generic-error'
import { GenericMonacoEditor } from '../../components/editors/generic-monaco-editor'
import { LibraryList } from './library-list'
import { AddMovieLibrary } from './add-movie-library'
import { MovieList } from './movie-list'
import { Watch } from './watch'
import { EditMovie } from './edit-movie'
import { EncodingTasks } from './encoding-tasks'
import { EncodingTaskDetails } from './encoding-tasks/encoding-task-details'
import { MovieOverview } from './movie-overview'

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
                  const { result: movie } = await injector.getInstance(MediaApiService).call({
                    method: 'GET',
                    action: '/movies/:id',
                    url: { id: match.params.movieId },
                    query: {},
                  })
                  return <EditMovie movie={movie} />
                }}
              />
            ),
          },
          { url: '/movies/add-new-movie-library', component: () => <AddMovieLibrary /> },
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
            url: '/movies/encoding-tasks/:encodingTaskId',
            component: ({ match }) => (
              <LazyLoad
                loader={<Init message="Loading Task..." />}
                error={(error, retry) => <GenericErrorPage error={error} retry={retry} />}
                component={async () => {
                  const { result: task } = await injector.getInstance(MediaApiService).call({
                    method: 'GET',
                    action: '/encode/tasks/:id',
                    url: { id: match.params.encodingTaskId },
                    query: {},
                  })
                  return <EncodingTaskDetails encodingTask={task} />
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
                  const { result: libs } = await injector.getInstance(MediaApiService).call({
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
                    const libraryId = match.params.libraryId as string
                    const { result: movies } = await injector.getInstance(MediaApiService).call({
                      method: 'GET',
                      action: '/movies',
                      query: { findOptions: { filter: { libraryId: { $eq: libraryId } } } },
                    })
                    const { result: watchProgresses } = await injector.getInstance(MediaApiService).call({
                      method: 'GET',
                      action: '/my-watch-progress',
                      query: {
                        findOptions: {
                          filter: {
                            movieId: { $in: movies.entries.map((m) => m._id) },
                          },
                        },
                      },
                    })
                    return (
                      <div style={{ width: '100%', height: '100%' }}>
                        <MovieList movies={movies.entries as media.Movie[]} watchProgresses={watchProgresses.entries} />
                        <Fab
                          title="Watch encoding jobs"
                          style={{ marginBottom: '5em', transform: 'scale(0.75)' }}
                          onclick={() => {
                            window.history.pushState('', '', `/movies/edit-library/${libraryId}`)
                          }}>
                          ✏
                        </Fab>
                      </div>
                    )
                  }}
                />
              )
            },
          },
          {
            url: '/movies/edit-library/:libraryId',
            component: ({ match }) => {
              const libraryId = match.params.libraryId as string
              return (
                <LazyLoad
                  loader={<Init message="Loading Library..." />}
                  error={(error, retry) => (
                    <GenericErrorPage
                      subtitle="Something bad happened during loading the movie list"
                      error={error}
                      retry={retry}
                    />
                  )}
                  component={async () => {
                    const { result: lib } = await injector.getInstance(MediaApiService).call({
                      method: 'GET',
                      action: '/movie-libraries/:id',
                      url: { id: libraryId },
                      query: {},
                    })
                    return (
                      <GenericMonacoEditor<media.MovieLibrary, 'mediaSchema', 'MovieLibrary'>
                        schema="mediaSchema"
                        entity="MovieLibrary"
                        data={lib as media.MovieLibrary}
                        title={`Edit movie library '${lib.name}'`}
                        onSave={async ({ _id, ...entity }) => {
                          await injector.getInstance(MediaApiService).call({
                            method: 'PATCH',
                            action: '/movie-libraries/:id',
                            url: { id: libraryId },
                            body: entity,
                          })
                        }}
                      />
                    )
                  }}
                />
              )
            },
          },
          {
            url: '/movies/overview/:movieId',
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
                  const { result: movie } = await injector.getInstance(MediaApiService).call({
                    method: 'GET',
                    action: '/movies/:id',
                    url: { id: match.params.movieId },
                    query: {},
                  })
                  const { result: movieProgress } = await injector.getInstance(MediaApiService).call({
                    method: 'GET',
                    action: '/my-watch-progress',
                    query: {
                      findOptions: {
                        filter: { movieId: { $eq: match.params.movieId }, completed: { $eq: false } },
                        order: { lastWatchDate: 'DESC' },
                      },
                    },
                  })

                  const { result: subtitles } = await injector.getInstance(MediaApiService).call({
                    method: 'GET',
                    action: '/movies/:movieId/subtitles',
                    url: { movieId: match.params.movieId },
                  })

                  return (
                    <MovieOverview
                      watchedSeconds={movieProgress.entries[0] ? movieProgress.entries[0].watchedSeconds : 0}
                      movie={movie}
                      availableSubtitles={subtitles}
                    />
                  )
                }}
              />
            ),
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
                  const { result: movie } = await injector.getInstance(MediaApiService).call({
                    method: 'GET',
                    action: '/movies/:id',
                    url: { id: match.params.movieId },
                    query: {},
                  })
                  const { result: movieProgress } = await injector.getInstance(MediaApiService).call({
                    method: 'GET',
                    action: '/my-watch-progress',
                    query: {
                      findOptions: {
                        filter: { movieId: { $eq: match.params.movieId }, completed: { $eq: false } },
                        order: { lastWatchDate: 'DESC' },
                      },
                    },
                  })

                  const { result: subtitles } = await injector.getInstance(MediaApiService).call({
                    method: 'GET',
                    action: '/movies/:movieId/subtitles',
                    url: { movieId: match.params.movieId },
                  })

                  return (
                    <Watch
                      watchedSeconds={movieProgress.entries[0] ? movieProgress.entries[0].watchedSeconds : 0}
                      movie={movie}
                      availableSubtitles={subtitles}
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
