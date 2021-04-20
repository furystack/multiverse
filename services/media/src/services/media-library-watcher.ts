import { watch, FSWatcher } from 'chokidar'
import { Injectable, Injector } from '@furystack/inject'
import { ScopedLogger } from '@furystack/logging'
import { media } from '@common/models'
import { StoreManager } from '@furystack/core'
import { isMovieFile } from '../utils/is-movie-file'
import { isSampleFile } from '../utils/is-sample-file'
import { getFfprobeData } from '../utils/get-ffprobe-data'
import { getUniversalMetadataFromOmdb } from '../utils/get-universal-metadata-from-omdb'
import { getFallbackMetadata } from '../utils/get-fallback-metadata'
import { fetchOmdbMetadata } from '../utils/fetch-omdb-metadata'

@Injectable({ lifetime: 'singleton' })
export class MediaLibraryWatcher {
  private readonly logger: ScopedLogger

  private watchers = new Map<string, FSWatcher>()

  private onMovieLibraryAdded = this.injector
    .getDataSetFor(media.MovieLibrary, '_id')
    .onEntityAdded.subscribe(({ entity }) => {
      this.initWatcherForLibrary(entity)
    })

  private onMovieLibraryRemoved = this.injector
    .getDataSetFor(media.MovieLibrary, '_id')
    .onEntityRemoved.subscribe(({ key }) => {
      const watcher = this.watchers.get(key as any)
      if (watcher) {
        watcher.close()
        this.watchers.delete(key as any)
      }
    })

  public async dispose() {
    this.onMovieLibraryAdded.dispose()
    this.onMovieLibraryRemoved.dispose()
    for (const watcher of this.watchers.values()) {
      watcher.close()
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

      const dataSet = this.injector.getDataSetFor(media.Movie, '_id')

      const movieEntries = await dataSet.find(this.injector, { top: 1, filter: { path: { $eq: name } } })
      if (!movieEntries.length) {
        await this.logger.information({
          message: `New Movie found, adding to Library...`,
          data: { moviePath: name, library, stats },
        })
        try {
          const fallbackMeta = getFallbackMetadata(name)
          const ffprobe = await getFfprobeData(name)
          const omdbMeta = await fetchOmdbMetadata({
            title: fallbackMeta.title,
            year: fallbackMeta.year,
            episode: fallbackMeta.episode,
            season: fallbackMeta.season,
          })
          const metadata = media.isValidOmdbMetadata(omdbMeta) ? getUniversalMetadataFromOmdb(omdbMeta) : fallbackMeta

          await dataSet.add(this.injector, {
            path: name,
            libraryId: library._id,
            metadata,
            omdbMeta,
            ffprobe,
          })
          // Should be a manual step to avoid initial high pressure
          // await createEncodingTaskForMovie({ injector: this.injector, movie: createResult.created[0] })
          // await extractSubtitles({ injector: this.injector, movie: createResult.created[0] })
        } catch (error) {
          await this.logger.error({
            message: 'Something went wrong when adding a new entry to the Movie Library',
            data: { error },
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
    this.logger = injector.logger.withScope('MediaLibraryWatcher')
    this.init()
  }
}
