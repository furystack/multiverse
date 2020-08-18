import { Injector } from '@furystack/inject'
import { media } from '@common/models'
import { databases } from '@common/config'
import '@furystack/mongodb-store'

export const setupStores = (injector: Injector) => {
  injector.setupStores((sm) =>
    sm
      .useMongoDb({
        model: media.MovieLibrary,
        primaryKey: '_id',
        url: databases.media.mongoUrl,
        db: databases.media.dbName,
        collection: databases.media.movieLibraries,
      })
      .useMongoDb({
        model: media.Movie,
        primaryKey: '_id',
        url: databases.media.mongoUrl,
        db: databases.media.dbName,
        collection: databases.media.movies,
      })
      .useMongoDb({
        model: media.MovieWatchHistoryEntry,
        primaryKey: '_id',
        url: databases.media.mongoUrl,
        db: databases.media.dbName,
        collection: databases.media.movieWatchEntries,
      })
      .useMongoDb({
        model: media.EncodingTask,
        primaryKey: '_id',
        url: databases.media.mongoUrl,
        db: databases.media.dbName,
        collection: databases.media.encodingTasks,
      }),
  )
}
