import type { PatchEntry } from '@common/service-utils'
import { verifyAndCreateIndexes } from '@common/service-utils'
import { dashboard } from '@common/models'

export const createInitialIndexes: PatchEntry = {
  patchName: '00-create-initial-indexes',
  patchDescription: 'Creates the following indexes: Dashboard/name',
  mode: 'once',
  exec: async (injector) => {
    const errors: Array<{ message: string; stack: string }> = []
    const indexings = [
      verifyAndCreateIndexes({
        injector,
        model: dashboard.Dashboard,
        indexName: 'scope',
        indexSpecification: { name: 1 },
        indexOptions: { unique: false },
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
