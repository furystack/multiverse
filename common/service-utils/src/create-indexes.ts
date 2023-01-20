import type { Injector, Constructable } from '@furystack/inject'
import { MongodbStore } from '@furystack/mongodb-store'
import { StoreManager } from '@furystack/core'
import type { IndexSpecification, CreateIndexesOptions } from 'mongodb'

export const verifyAndCreateIndexes = async <T extends object>(options: {
  injector: Injector
  model: Constructable<T>
  indexName: string
  indexSpecification: IndexSpecification
  indexOptions: CreateIndexesOptions
}) => {
  const store: MongodbStore<T, any> = options.injector
    .getInstance(StoreManager)
    .getStoreFor(options.model, '_id' as any) // ToDo: Fix Me
  if (!(store instanceof MongodbStore)) {
    throw Error(`Store for ${options.model.name} is not a MongodbStore!`)
  }
  const collection = await store.getCollection()
  await collection.createIndex(options.indexSpecification)
}
