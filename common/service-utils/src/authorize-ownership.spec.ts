import { auth } from '@common/models'
import { addStore, IdentityContext, InMemoryStore } from '@furystack/core'
import { usingAsync } from '@furystack/utils'
import { Injector } from '@furystack/inject'
import { AuthorizeOwnership } from './authorize-ownership'

describe('authorizeOwnership', () => {
  const useMockAuthentication = (injector: Injector, options: Partial<IdentityContext>) => {
    const ic = new IdentityContext()
    Object.assign(ic, options)
    injector.setExplicitInstance(ic)
  }

  it('Should authorize owners as user', async () => {
    await usingAsync(new Injector(), async (injector) => {
      useMockAuthentication(injector, { getCurrentUser: async () => ({ username: 'example-user', roles: [] } as any) })
      const authorizer = AuthorizeOwnership({
        level: ['owner'],
      })

      const result = await authorizer({
        injector,
        entity: {
          owner: {
            type: 'user',
            username: 'example-user',
          },
        },
      })
      expect(result.isAllowed).toBeTruthy()

      const falseResult = await authorizer({
        injector,
        entity: {
          owner: {
            type: 'user',
            username: 'other-user',
          },
        },
      })
      expect(falseResult.isAllowed).toBeFalsy()
    })
  })

  it('Should authorize Org.Owner by Organization', async () => {
    await usingAsync(new Injector(), async (injector) => {
      const orgStore = new InMemoryStore({
        model: auth.Organization,
        primaryKey: '_id',
      })
      addStore(injector, orgStore)
      const username = `example-username`
      const organizationName = `example-organization`

      await orgStore.add({
        _id: 'example-user-id',
        name: organizationName,
        description: '',
        adminNames: [username],
        icon: '',
        memberNames: [],
        owner: {
          type: 'user',
          username,
        },
      })

      useMockAuthentication(injector, { getCurrentUser: async () => ({ username, roles: [] } as any) })
      const authorizer = AuthorizeOwnership({
        level: ['organizationOwner'],
      })

      const result = await authorizer({
        injector,
        entity: {
          owner: {
            type: 'organization',
            organizationName,
          },
        },
      })
      expect(result.isAllowed).toBeTruthy()

      const falseResult = await authorizer({
        injector,
        entity: {
          owner: {
            type: 'organization',
            organizationName: 'other-organization',
          },
        },
      })
      expect(falseResult.isAllowed).toBeFalsy()
    })
  })

  it('Should authorize Org.Admin by Organization', async () => {
    await usingAsync(new Injector(), async (injector) => {
      const orgStore = new InMemoryStore({
        model: auth.Organization,
        primaryKey: '_id',
      })
      addStore(injector, orgStore)
      const username = `example-username`
      const organizationName = 'example-organization'

      await orgStore.add({
        _id: 'example-user-id',
        name: organizationName,
        description: '',
        adminNames: [username],
        icon: '',
        memberNames: [],
        owner: {
          type: 'system',
        },
      })

      useMockAuthentication(injector, { getCurrentUser: async () => ({ username, roles: [] } as any) })
      const authorizer = AuthorizeOwnership({
        level: ['admin'],
      })

      const result = await authorizer({
        injector,
        entity: {
          owner: {
            type: 'organization',
            organizationName,
          },
        },
      })
      expect(result.isAllowed).toBeTruthy()

      const falseResult = await authorizer({
        injector,
        entity: {
          owner: {
            type: 'organization',
            organizationName: 'other-organization',
          },
        },
      })
      expect(falseResult.isAllowed).toBeFalsy()
    })
  })

  it('Should authorize Org.Member by Organization', async () => {
    await usingAsync(new Injector(), async (injector) => {
      const orgStore = new InMemoryStore({
        model: auth.Organization,
        primaryKey: '_id',
      })
      addStore(injector, orgStore)
      const username = 'example-username'
      const organizationName = 'example-organization'

      await orgStore.add({
        _id: 'example-user-id',
        name: organizationName,
        description: '',
        adminNames: [],
        icon: '',
        memberNames: [username],
        owner: {
          type: 'system',
        },
      })

      useMockAuthentication(injector, { getCurrentUser: async () => ({ username, roles: [] } as any) })
      const authorizer = AuthorizeOwnership({
        level: ['member'],
      })

      const result = await authorizer({
        injector,
        entity: {
          owner: {
            type: 'organization',
            organizationName,
          },
        },
      })
      expect(result.isAllowed).toBeTruthy()

      const falseResult = await authorizer({
        injector,
        entity: {
          owner: {
            type: 'organization',
            organizationName: 'other-organization',
          },
        },
      })
      expect(falseResult.isAllowed).toBeFalsy()
    })
  })
})
