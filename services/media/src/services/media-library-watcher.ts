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
import { getMovieMetadata } from '../utils/get-movie-metadata'

@Injectable({ lifetime: 'singleton' })
export class MediaLibraryWatcher {
  private readonly logger: ScopedLogger

  private watchers = new Map<string, FSWatcher>()

  public async dispose() {
    for (const watcher of this.watchers.values()) {
      watcher.close()
    }
  }

  private initWatcherForLibrary(library: media.MovieLibrary) {
    const libWatcher = watch(library.path, {
      ignoreInitial: false,
      awaitWriteFinish: true,
      usePolling: true,
      interval: 15 * 60 * 1000, // 15 minutes
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

        const ffprobe = await getFfprobeData(name)
        const omdbMeta = await getMovieMetadata(name)
        const metadata = media.isValidOmdbMetadata(omdbMeta)
          ? getUniversalMetadataFromOmdb(omdbMeta)
          : getFallbackMetadata(name)

        await dataSet.add(this.injector, {
          path: name,
          libraryId: library._id,
          metadata,
          omdbMeta,
          ffprobe,
        })
      }
    })

    this.watchers.set(library._id, libWatcher)
  }

  public onLibraryAdded(library: media.MovieLibrary) {
    this.initWatcherForLibrary(library)
  }

  public onLibraryRemoved(library: media.MovieLibrary) {
    const watcher = this.watchers.get(library._id)
    if (watcher) {
      watcher.close()
      this.watchers.delete(library._id)
    }
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
