import { verifyAndCreateIndexes, PatchEntry } from '@common/service-utils'
import { media } from '@common/models'

export const createInitialIndexes: PatchEntry = {
  patchName: '00-create-initial-indexes',
  patchDescription:
    'Creates the following indexes: Movie/moviePath(unique), MovieLibrary/path (unique), MovieWatchHistoryEntry/userId',
  mode: 'once',
  exec: async (injector) => {
    const errors: Array<{ message: string; stack: string }> = []
    const indexings = [
      verifyAndCreateIndexes({
        injector,
        model: media.Movie,
        indexName: 'moviePath',
        indexSpecification: { path: 1 },
        indexOptions: { unique: true },
      }),

      verifyAndCreateIndexes({
        injector,
        model: media.MovieLibrary,
        indexName: 'movieLibUniquePath',
        indexSpecification: { path: 1 },
        indexOptions: { unique: true },
      }),

      verifyAndCreateIndexes({
        injector,
        model: media.MovieWatchHistoryEntry,
        indexName: 'movieWatchEntryUser',
        indexSpecification: { userId: 1 },
        indexOptions: {},
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
