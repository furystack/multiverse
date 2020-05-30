import { Injectable, Injector } from '@furystack/inject'
import { ScopedLogger } from '@furystack/logging'

@Injectable({ lifetime: 'singleton' })
export class MetadataFetcher {
  private logger: ScopedLogger

  tick = (async () => {
    this.logger.verbose({ message: 'Starting metadata trace...' })

    this.logger.verbose({ message: 'Trace finished' })
  }).bind(this)

  constructor(injector: Injector) {
    this.logger = injector.logger.withScope('MetadataFetcher')
  }
}
