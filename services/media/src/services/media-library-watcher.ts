import { watch, FSWatcher } from 'chokidar'
import { Injectable, Injector } from '@furystack/inject'
import { ScopedLogger } from '@furystack/logging'
import { media } from '@common/models'
import { isMovieFile } from '../utils/is-movie-file'
import { isSampleFile } from '../utils/is-sample-file'
import { MetadataFetcher } from './metadata-fetcher'

@Injectable()
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
        const movie = await await dataSet.add(this.injector, {
          path: name,
          libraryId: library._id,
        })
        await this.fetcher.tryGetMetadataForMovie(movie.created[0])
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
    const movieLibraries = await this.injector.getDataSetFor(media.MovieLibrary).find(this.injector, {})
    this.logger.verbose({
      message: 'Initializing library watchers...',
      data: { paths: movieLibraries.map((m) => m.path) },
    })
    movieLibraries.map((lib) => this.initWatcherForLibrary(lib))
  }

  constructor(private readonly injector: Injector, private readonly fetcher: MetadataFetcher) {
    this.logger = injector.logger.withScope('MediaLibraryWatcher')
    this.init()
  }
}
