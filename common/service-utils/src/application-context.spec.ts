import { Injector } from '@furystack/inject'
import { ApplicationContextService } from './application-context'

describe('Application Context', () => {
  it('Should set and get the context', () => {
    const ctx = 'example-app-context'
    const i = new Injector()
    i.setExplicitInstance(new ApplicationContextService(ctx))
    expect(i.getInstance(ApplicationContextService).name).toBe(ctx)
  })
})
