import { Injector } from '@furystack/inject'
import { auth } from '@common/models'

export const setupRepository = (injector: Injector) => {
  injector.setupRepository((repo) =>
    repo.createDataSet(auth.Profile, '_id', {
      authorizeUpdateEntity: async ({ injector: i, entity: profile }) => {
        const currentUser = await i.getCurrentUser()
        if (profile.username === currentUser.username) {
          return { isAllowed: true }
        }
        i.logger.withScope('auth repository').warning({
          message: `User '${currentUser.username}' has tried to modify the profile of user '${profile.username}' without permission`,
          data: { sendToSlack: true },
        })
        return { isAllowed: false, message: 'Only the owner can modify its profile' }
      },
    }),
  )
}
