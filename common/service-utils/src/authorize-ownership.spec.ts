import { auth } from '@common/models'
import { addStore, InMemoryStore } from '@furystack/core'
import { Injector } from '@furystack/inject'
import { HttpUserContext } from '@furystack/rest-service'
import { v4 } from 'uuid'
import { AuthorizeOwnership } from './authorize-ownership'

describe('authorizeOwnership', () => {
  it('Should authorize owners as user', async () => {
    const injector = new Injector()
    injector.getInstance(HttpUserContext).getCurrentUser = async () => ({ username: 'example-user', roles: [] } as any)
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

  it('Should authorize Org.Owner by Organization', async () => {
    const injector = new Injector()
    const orgStore = new InMemoryStore({
      model: auth.Organization,
      primaryKey: '_id',
    })
    addStore(injector, orgStore)
    const username = v4()
    const organizationName = v4()

    await orgStore.add({
      _id: v4(),
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

    injector.getInstance(HttpUserContext).getCurrentUser = async () => ({ username, roles: [] } as any)
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

  it('Should authorize Org.Admin by Organization', async () => {
    const injector = new Injector()
    const orgStore = new InMemoryStore({
      model: auth.Organization,
      primaryKey: '_id',
    })
    addStore(injector, orgStore)
    const username = v4()
    const organizationName = v4()

    await orgStore.add({
      _id: v4(),
      name: organizationName,
      description: '',
      adminNames: [username],
      icon: '',
      memberNames: [],
      owner: {
        type: 'system',
      },
    })

    injector.getInstance(HttpUserContext).getCurrentUser = async () => ({ username, roles: [] } as any)
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

  it('Should authorize Org.Member by Organization', async () => {
    const injector = new Injector()
    const orgStore = new InMemoryStore({
      model: auth.Organization,
      primaryKey: '_id',
    })
    addStore(injector, orgStore)
    const username = v4()
    const organizationName = v4()

    await orgStore.add({
      _id: v4(),
      name: organizationName,
      description: '',
      adminNames: [],
      icon: '',
      memberNames: [username],
      owner: {
        type: 'system',
      },
    })

    injector.getInstance(HttpUserContext).getCurrentUser = async () => ({ username, roles: [] } as any)
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
