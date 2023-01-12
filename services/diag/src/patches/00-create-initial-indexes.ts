import type { PatchEntry } from '@common/service-utils'
import { verifyAndCreateIndexes } from '@common/service-utils'
import { diag } from '@common/models'

export const createInitialIndexes: PatchEntry = {
  patchName: '00-create-initial-indexes',
  patchDescription: 'Creates the following indexes: LogEntry/Scope, LogEntry/level, LogEntry/creationDate',
  mode: 'once',
  exec: async (injector) => {
    const errors: Array<{ message: string; stack: string }> = []
    const indexings = [
      verifyAndCreateIndexes({
        injector,
        model: diag.LogEntry,
        indexName: 'scope',
        indexSpecification: { scope: 1 },
        indexOptions: { unique: false },
      }),
      verifyAndCreateIndexes({
        injector,
        model: diag.LogEntry,
        indexName: 'level',
        indexSpecification: { level: 1 },
        indexOptions: { unique: false },
      }),

      verifyAndCreateIndexes({
        injector,
        model: diag.LogEntry,
        indexName: 'creationDate',
        indexSpecification: { creationDate: 1 },
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
