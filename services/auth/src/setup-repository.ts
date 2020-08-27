import { Injector } from '@furystack/inject'
import { auth } from '@common/models'

export const setupRepository = (injector: Injector) => {
  injector.setupRepository((repo) =>
    repo.createDataSet(auth.Profile, {
      authorizeUpdateEntity: async ({ injector: i, entity: profile }) => {
        const currentUser = await i.getCurrentUser()
        if (profile.username === currentUser.username) {
          return { isAllowed: true }
        }
        return { isAllowed: false, message: 'Only the owner can modify its profile' }
      },
    }),
  )
}
