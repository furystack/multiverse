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
import { extractSubtitles } from '../utils/extract-subtitles'
import { createEncodingTaskForMovie } from '../utils/create-encoding-task-for-movie'

@Injectable({ lifetime: 'singleton' })
export class MediaLibraryWatcher {
  private readonly logger: ScopedLogger

  private watchers = new Map<string, FSWatcher>()

  private onMovieLibraryAdded = this.injector
    .getDataSetFor(media.MovieLibrary)
    .onEntityAdded.subscribe(({ entity }) => {
      this.initWatcherForLibrary(entity)
    })

  private onMovieLibraryRemoved = this.injector
    .getDataSetFor(media.MovieLibrary)
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
      usePolling: true,

      interval: 120 * 60 * 1000, // 2 hours
    })
    libWatcher.on('add', async (name, stats) => {
      if (!isMovieFile(name)) {
        return
      }
      if (isSampleFile(name)) {
        return
      }

      const dataSet = this.injector.getDataSetFor(media.Movie)

      const movieEntries = await dataSet.find(this.injector, { top: 1, filter: { path: { $eq: name } } })
      if (!movieEntries.length) {
        this.logger.information({
          message: `New Movie found, adding to Library...`,
          data: { moviePath: name, library, stats },
        })

        const fallbackMeta = getFallbackMetadata(name)
        const ffprobe = await getFfprobeData(name)
        const omdbMeta = await fetchOmdbMetadata({
          title: fallbackMeta.title,
          year: fallbackMeta.year,
          episode: fallbackMeta.episode,
          season: fallbackMeta.season,
        })
        const metadata = media.isValidOmdbMetadata(omdbMeta) ? getUniversalMetadataFromOmdb(omdbMeta) : fallbackMeta

        const createResult = await dataSet.add(this.injector, {
          path: name,
          libraryId: library._id,
          metadata,
          omdbMeta,
          ffprobe,
        })
        await createEncodingTaskForMovie({ injector: this.injector, movie: createResult.created[0] })
        await extractSubtitles({ injector: this.injector, movie: createResult.created[0] })
      }
    })

    this.watchers.set(library._id, libWatcher)
  }

  private async init() {
    const movieLibraries = await this.injector.getInstance(StoreManager).getStoreFor(media.MovieLibrary).find({})
    this.logger.verbose({
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
