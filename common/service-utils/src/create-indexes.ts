import { Injector, Constructable } from '@furystack/inject'
import { MongodbStore } from '@furystack/mongodb-store'
import { StoreManager } from '@furystack/core'
import { IndexOptions } from 'mongodb'

export const verifyAndCreateIndexes = async <T extends { _id: string }>(options: {
  injector: Injector
  model: Constructable<T>
  indexName: string
  indexSpecification: { [K in keyof T]?: 1 }
  indexOptions: IndexOptions
}) => {
  const store: MongodbStore<T> = options.injector.getInstance(StoreManager).getStoreFor(options.model)
  if (!(store instanceof MongodbStore)) {
    throw Error(`Store for ${options.model.name} is not a MongodbStore!`)
  }
  const collection = await store.getCollection()

  const indexExists = await collection.indexExists(options.indexName)
  if (!indexExists) {
    options.injector.logger.withScope(`index-checker`).information({
      message: 'Index was missing, creating...',
      data: { modelName: options.model.name, indexName: options.indexName },
    })
    await collection.createIndex(options.indexSpecification, { ...options.indexOptions, name: options.indexName })
  }
}
