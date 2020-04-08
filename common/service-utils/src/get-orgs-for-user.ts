import { Injector } from '@furystack/inject'
import { MongodbStore } from '@furystack/mongodb-store'
import { Organization } from '@common/models'
import { StoreManager, User } from '@furystack/core'

export const getOrgsForCurrentUser = async (injector: Injector, user: User) => {
  const store: MongodbStore<Organization> = injector.getInstance(StoreManager).getStoreFor(Organization)
  const collection = await store.getCollection()

  return await collection
    .find({
      $or: [{ ownerName: { $eq: user.username } }, { adminNames: user.username }, { memberNames: user.username }],
    })
    .toArray()
}
