import { verifyAndCreateIndexes, PatchEntry } from '@common/service-utils'
import { xpense } from '@common/models'

export const createInitialIndexes: PatchEntry = {
  patchName: '00-create-initial-indexes',
  mode: 'once',
  exec: async (injector) => {
    const errors: Array<{ message: string; stack: string }> = []
    const indexings = [
      verifyAndCreateIndexes({
        injector,
        model: xpense.Item,
        indexName: 'itemName',
        indexSpecification: { name: 1 },
        indexOptions: { unique: true },
      }),
      verifyAndCreateIndexes({
        injector,
        model: xpense.Shop,
        indexName: 'shopName',
        indexSpecification: { name: 1 },
        indexOptions: { unique: true },
      }),

      verifyAndCreateIndexes({
        injector,
        model: xpense.Account,
        indexName: 'balanceOwner',
        indexSpecification: { owner: 1, name: 1 },
        indexOptions: { unique: true },
      }),
    ]

    const result = await Promise.allSettled(indexings)

    result.map((r) => {
      if (r.status === 'rejected') {
        errors.push(r.reason)
      }
    })

    return { errors, updates: [], warns: [] }
  },
}
