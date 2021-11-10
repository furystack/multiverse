import { verifyAndCreateIndexes, PatchEntry } from '@common/service-utils'
import { media } from '@common/models'

export const createSeriesIndex: PatchEntry = {
  patchName: '01-create-series-index',
  patchDescription: 'Creates the following index: Series/imdbId(unique)',
  mode: 'once',
  exec: async (injector) => {
    const errors: Array<{ message: string; stack: string }> = []
    const indexings = [
      verifyAndCreateIndexes({
        injector,
        model: media.Series,
        indexName: 'imdbId',
        indexSpecification: { imdbId: 1 },
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
