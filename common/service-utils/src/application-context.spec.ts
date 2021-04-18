import { Injector } from '@furystack/inject'
import { v4 } from 'uuid'
import { ApplicationContextService } from './application-context'

describe('Application Context', () => {
  it('Should add an extension method', () => {
    expect(typeof new Injector().setupApplicationContext).toBe('function')
    expect(typeof new Injector().getApplicationContext).toBe('function')
  })

  it('Should use the extension mehtod', () => {
    const ctx = v4()
    const i = new Injector()
    i.setupApplicationContext(new ApplicationContextService(ctx))
    expect(i.getApplicationContext().name).toBe(ctx)
  })
})
