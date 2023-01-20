import type { Injector } from '@furystack/inject'
import type { MongodbStore } from '@furystack/mongodb-store'
import { auth } from '@common/models'
import type { User } from '@furystack/core'
import { StoreManager } from '@furystack/core'

export const getOrgsForCurrentUser = async (injector: Injector, user: User) => {
  const store: MongodbStore<auth.Organization, '_id'> = injector
    .getInstance(StoreManager)
    .getStoreFor(auth.Organization, '_id')
  const collection = await store.getCollection()

  return await collection
    .find({
      $or: [{ ownerName: { $eq: user.username } }, { adminNames: user.username }, { memberNames: user.username }],
    })
    .toArray()
}
