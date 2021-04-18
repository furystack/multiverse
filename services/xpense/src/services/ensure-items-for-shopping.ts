import { Injector } from '@furystack/inject'
import { xpense } from '@common/models'
import { StoreManager } from '@furystack/core'
import { MongodbStore } from '@furystack/mongodb-store'
import { ObjectId } from 'mongodb'

export const ensureItemsForShopping = async ({
  injector,
  shopping,
}: {
  injector: Injector
  shopping: xpense.Shopping
}) => {
  const logger = injector.logger.withScope('xpense/services/ensureItemsForShopping')
  const shopStore: MongodbStore<xpense.Shop, '_id'> = injector.getInstance(StoreManager).getStoreFor(xpense.Shop, '_id')
  const itemStore: MongodbStore<xpense.Item, '_id'> = injector.getInstance(StoreManager).getStoreFor(xpense.Item, '_id')

  const shopCollection = await shopStore.getCollection()
  const itemCollection = await itemStore.getCollection()

  const shop = await shopCollection.findOne({ name: shopping.shopName })
  if (!shop) {
    await logger.information({ message: `Shop '${shopping.shopName}' does not exists, adding...` })
    await shopCollection.insertOne({
      name: shopping.shopName,
      creationDate: new Date().toISOString(),
      createdBy: shopping.createdBy,
      _id: new ObjectId().toHexString(),
    } as any)
  }

  for (const entry of shopping.entries) {
    const existing = await itemCollection.findOne({ name: entry.itemName })
    if (!existing) {
      await logger.information({ message: `Entry '${entry.itemName}' does not exists, adding...` })
      await itemCollection.insertOne({
        creationDate: new Date().toISOString(),
        createdBy: shopping.createdBy,
        _id: new ObjectId().toHexString(),
        name: entry.itemName,
      })
    }
  }
}
