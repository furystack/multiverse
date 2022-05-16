import { Injector } from '@furystack/inject'
import { auth } from '@common/models'
import { getRepository } from '@furystack/repository'
import { getCurrentUser } from '@furystack/core'
import { getLogger } from '@furystack/logging'

export const setupRepository = (injector: Injector) => {
  getRepository(injector).createDataSet(auth.Profile, '_id', {
    authorizeUpdateEntity: async ({ injector: i, entity: profile }) => {
      const currentUser = await getCurrentUser(i)
      if (profile.username === currentUser.username) {
        return { isAllowed: true }
      }
      getLogger(i)
        .withScope('auth repository')
        .warning({
          message: `User '${currentUser.username}' has tried to modify the profile of user '${profile.username}' without permission`,
          data: { sendToSlack: true },
        })
      return { isAllowed: false, message: 'Only the owner can modify its profile' }
    },
  })
}
