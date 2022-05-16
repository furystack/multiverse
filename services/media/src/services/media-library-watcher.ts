import { watch, FSWatcher } from 'chokidar'
import { Injectable, Injector } from '@furystack/inject'
import { getLogger, ScopedLogger } from '@furystack/logging'
import { media } from '@common/models'
import { StoreManager } from '@furystack/core'
import Semaphore from 'semaphore-async-await'
import { getDataSetFor } from '@furystack/repository'
import { isMovieFile } from '../utils/is-movie-file'
import { isSampleFile } from '../utils/is-sample-file'
import { getFfprobeData } from '../utils/get-ffprobe-data'
import { getUniversalMetadataFromOmdb } from '../utils/get-universal-metadata-from-omdb'
import { getFallbackMetadata } from '../utils/get-fallback-metadata'
import { fetchOmdbMovieMetadata } from '../utils/fetch-omdb-movie-metadata'
import { createEncodingTaskForMovie } from '../utils/create-encoding-task-for-movie'
import { extractSubtitles } from '../utils/extract-subtitles'
import { fetchOmdbSeriesMetadata } from '../utils/fetch-omdb-series-metadata'

@Injectable({ lifetime: 'singleton' })
export class MediaLibraryWatcher {
  private readonly logger: ScopedLogger

  private readonly lock = new Semaphore(1)

  private watchers = new Map<string, FSWatcher>()

  private onMovieLibraryAdded = getDataSetFor(this.injector, media.MovieLibrary, '_id').onEntityAdded.subscribe(
    ({ entity }) => {
      this.initWatcherForLibrary(entity)
    },
  )

  private onMovieLibraryRemoved = getDataSetFor(this.injector, media.MovieLibrary, '_id').onEntityRemoved.subscribe(
    ({ key }) => {
      const watcher = this.watchers.get(key as any)
      if (watcher) {
        watcher.close()
        this.watchers.delete(key as any)
      }
    },
  )

  public async dispose() {
    this.onMovieLibraryAdded.dispose()
    this.onMovieLibraryRemoved.dispose()
    for (const watcher of this.watchers.values()) {
      watcher.close()
    }
  }

  private async ensureSeriesExists(movie: media.Movie) {
    try {
      await this.lock.acquire()
      const imdbId = (movie.omdbMeta && movie.omdbMeta.Response === 'True' && movie.omdbMeta?.seriesID) || null
      if (imdbId) {
        const store = this.injector.getInstance(StoreManager).getStoreFor(media.Series, '_id')
        const existing = await store.find({
          filter: {
            imdbId: { $eq: imdbId },
          },
          top: 1,
        })

        if (!existing.length) {
          const omdbMetadata = await fetchOmdbSeriesMetadata({
            injector: this.injector,
            imdbId,
          })
          if (!omdbMetadata) {
            throw new Error(`Series data not found for imdb id '${imdbId}'`)
          }
          await store.add({
            imdbId,
            omdbMetadata,
          })
        }
      }
    } catch (error) {
      this.logger.warning({
        message: `Failed to fetch Series data for movie '${movie.metadata.title}'`,
        data: {
          movie,
          error,
        },
      })
    } finally {
      this.lock.release()
    }
  }

  private initWatcherForLibrary(library: media.MovieLibrary) {
    const libWatcher = watch(library.path, {
      ignoreInitial: false,
      awaitWriteFinish: true,
    })
    libWatcher.on('add', async (name, stats) => {
      if (!isMovieFile(name)) {
        return
      }
      if (isSampleFile(name)) {
        return
      }

      const dataSet = getDataSetFor(this.injector, media.Movie, '_id')

      const movieEntries = await dataSet.find(this.injector, { top: 1, filter: { path: { $eq: name } } })
      if (!movieEntries.length) {
        await this.logger.information({
          message: `New Movie found, adding to Library...`,
          data: { moviePath: name, library, stats },
        })
        try {
          const fallbackMeta = getFallbackMetadata(name)
          const ffprobe = await getFfprobeData(name)
          const omdbMeta = await fetchOmdbMovieMetadata({
            title: fallbackMeta.title,
            year: fallbackMeta.year,
            episode: fallbackMeta.episode,
            season: fallbackMeta.season,
            injector: this.injector,
          })
          const metadata = media.isValidOmdbMetadata(omdbMeta) ? getUniversalMetadataFromOmdb(omdbMeta) : fallbackMeta

          const createResult = await dataSet.add(this.injector, {
            path: name,
            libraryId: library._id,
            metadata,
            omdbMeta,
            ffprobe,
          })
          const createdMovie = createResult.created[0]

          if (library.autoCreateEncodingTasks) {
            try {
              await createEncodingTaskForMovie({ injector: this.injector, movie: createdMovie })
            } catch (error) {
              await this.logger.warning({
                message: `Failed to create encoding task for movie '${createdMovie.metadata.title}'`,
                data: { error, sendToSlack: true },
              })
            }
          }
          if (library.autoExtractSubtitles) {
            try {
              await extractSubtitles({ injector: this.injector, movie: createdMovie })
            } catch (error) {
              await this.logger.warning({
                message: `Failed to extract subtitles for movie '${createdMovie.metadata.title}'`,
                data: { error, sendToSlack: true },
              })
            }
          }
          await this.ensureSeriesExists(createdMovie)
        } catch (error) {
          await this.logger.error({
            message: 'Something went wrong when adding a new entry to the Movie Library',
            data: { error, sendToSlack: true },
          })
        }
      }
    })

    this.watchers.set(library._id, libWatcher)
  }

  private async init() {
    const movieLibraries = await this.injector.getInstance(StoreManager).getStoreFor(media.MovieLibrary, '_id').find({})
    await this.logger.verbose({
      message: 'Initializing library watchers...',
      data: { paths: movieLibraries.map((m) => m.path) },
    })
    movieLibraries.map((lib) => this.initWatcherForLibrary(lib))
  }

  constructor(private readonly injector: Injector) {
    this.logger = getLogger(injector).withScope('MediaLibraryWatcher')
    this.init()
  }
}
