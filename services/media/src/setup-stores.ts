import type { Injector } from '@furystack/inject'
import { media } from '@common/models'
import { databases } from '@common/config'
import { useMongoDb } from '@furystack/mongodb-store'

export const setupStores = (injector: Injector) => {
  useMongoDb({
    injector,
    model: media.MovieLibrary,
    primaryKey: '_id',
    url: databases.media.mongoUrl,
    db: databases.media.dbName,
    collection: databases.media.movieLibraries,
  })
  useMongoDb({
    injector,
    model: media.Movie,
    primaryKey: '_id',
    url: databases.media.mongoUrl,
    db: databases.media.dbName,
    collection: databases.media.movies,
  })
  useMongoDb({
    injector,
    model: media.Series,
    primaryKey: '_id',
    url: databases.media.mongoUrl,
    db: databases.media.dbName,
    collection: databases.media.series,
  })
  useMongoDb({
    injector,
    model: media.MovieWatchHistoryEntry,
    primaryKey: '_id',
    url: databases.media.mongoUrl,
    db: databases.media.dbName,
    collection: databases.media.movieWatchEntries,
  })
  useMongoDb({
    injector,
    model: media.EncodingTask,
    primaryKey: '_id',
    url: databases.media.mongoUrl,
    db: databases.media.dbName,
    collection: databases.media.encodingTasks,
  })
}
