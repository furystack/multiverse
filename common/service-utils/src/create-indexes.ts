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
  await collection.createIndex(options.indexSpecification, { ...options.indexOptions, name: options.indexName })
}
