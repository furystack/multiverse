import { Injector } from '@furystack/inject'
import { ServerManager } from '@furystack/rest-service'
import { DbLogger } from './use-db-logger'

export const attachShutdownHandler = (i: Injector) => {
  const logger = i.logger.withScope('shutdown-handler')

  const onExit = async ({ code, reason }: { code: number; reason: string; error?: any }) => {
    try {
      if (code) {
        await logger.warning({
          message: `Something bad happened, starting shutdown with code '${code}' due '${reason}'`,
          data: {
            code,
            reason,
          },
        })
      } else {
        await logger.warning({ message: `Shutting down gracefully due '${reason}'` })
      }
      await i.getInstance(ServerManager).dispose()
      await i.getInstance(DbLogger).dispose()
      await i.dispose()
    } catch (error) {
      console.error('Error during shutdown', error)
      process.exit(1)
    }
    process.exit(code)
  }

  process.once('exit', () => onExit({ code: 0, reason: 'exit' }))

  // catches ctrl+c event
  process.once('SIGINT', () => onExit({ code: 0, reason: 'SIGINT' }))

  // catches "kill pid" (for example: nodemon restart)
  process.once('SIGUSR1', () => onExit({ code: 0, reason: 'SIGUSR1' }))
  process.once('SIGUSR2', () => onExit({ code: 0, reason: 'SIGUSR2' }))

  // catches uncaught exceptions
  process.once('uncaughtException', (error) => {
    onExit({ code: 1, reason: 'uncaughtException', error })
  })

  process.once('unhandledRejection', (error) => onExit({ code: 1, reason: 'unhandledRejection', error }))
}
