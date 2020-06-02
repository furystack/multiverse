import '@furystack/auth-google'
import { verifyAndCreateIndexes } from '@common/service-utils'
import '@furystack/repository/dist/injector-extension'
import { ConsoleLogger } from '@furystack/logging'
import { Injector } from '@furystack/inject'
import { diag } from '@common/models'

export const injector = new Injector()

injector.useDbLogger({ appName: 'diag' }).useCommonHttpAuth().useLogging(ConsoleLogger)

verifyAndCreateIndexes({
  injector,
  model: diag.LogEntry,
  indexName: 'scope',
  indexSpecification: { scope: 1 },
  indexOptions: { unique: false },
})
verifyAndCreateIndexes({
  injector,
  model: diag.LogEntry,
  indexName: 'level',
  indexSpecification: { level: 1 },
  indexOptions: { unique: false },
})

verifyAndCreateIndexes({
  injector,
  model: diag.LogEntry,
  indexName: 'creationDate',
  indexSpecification: { creationDate: 1 },
  indexOptions: { unique: false },
})
