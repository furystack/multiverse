import type { PatchEntry } from '@common/service-utils'
import { verifyAndCreateIndexes } from '@common/service-utils'
import { auth } from '@common/models'

export const createInitialIndexes: PatchEntry = {
  patchName: '00-create-initial-indexes',
  patchDescription:
    'Creates the following indexes: GoogleAccount/googleId(unique), GithubAccount/githubId(unique), Profile/profileUserName(unique), Organization/orgName(unique)',
  mode: 'once',
  exec: async (injector) => {
    const errors: Array<{ message: string; stack: string }> = []
    const indexings = [
      verifyAndCreateIndexes({
        injector,
        model: auth.GoogleAccount,
        indexName: 'googleId',
        indexSpecification: { googleId: 1 },
        indexOptions: { unique: true },
      }),
      verifyAndCreateIndexes({
        injector,
        model: auth.GithubAccount,
        indexName: 'githubId',
        indexSpecification: { githubId: 1 },
        indexOptions: { unique: true },
      }),
      verifyAndCreateIndexes({
        injector,
        model: auth.Profile,
        indexName: 'profileUserName',
        indexSpecification: { username: 1 },
        indexOptions: { unique: true },
      }),
      verifyAndCreateIndexes({
        injector,
        model: auth.Organization,
        indexName: 'orgName',
        indexSpecification: { name: 1 },
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
