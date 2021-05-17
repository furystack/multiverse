import { Owner, auth } from '@common/models'
import { Injector } from '@furystack/inject'
import { AuthorizationResult } from '@furystack/repository'
import { StoreManager } from '@furystack/core'

export interface AuthorizeOwnershipOptions {
  level: Array<'owner' | 'organizationOwner' | 'admin' | 'member'>
}
export const AuthorizeOwnership: <T extends { owner: Owner }>(
  options: AuthorizeOwnershipOptions,
) => (authOptions: { injector: Injector; entity: T }) => Promise<AuthorizationResult> =
  (options) =>
  async ({ entity, injector }) => {
    const usr = await injector.getCurrentUser()
    const { owner } = entity
    if (options.level.includes('owner') && owner.type === 'user' && owner.username === usr.username) {
      return { isAllowed: true }
    }
    if (owner.type === 'organization') {
      const [ownerOrg] = await injector
        .getInstance(StoreManager)
        .getStoreFor(auth.Organization, '_id')
        .find({ top: 1, filter: { name: { $eq: owner.organizationName } } })
      if (ownerOrg) {
        if (
          options.level.includes('organizationOwner') &&
          ownerOrg.owner.type === 'user' &&
          ownerOrg.owner.username === usr.username
        ) {
          return { isAllowed: true }
        }
        if (options.level.includes('admin') && ownerOrg.adminNames.includes(usr.username)) {
          return { isAllowed: true }
        }
        if (options.level.includes('member') && ownerOrg.memberNames.includes(usr.username)) {
          return { isAllowed: true }
        }
      }
    }
    return { isAllowed: false, message: `Not in a valid role: ${options.level.join(',')}` }
  }
