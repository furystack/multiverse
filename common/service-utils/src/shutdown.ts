import { Injector } from '@furystack/inject'
import { ServerManager } from '@furystack/rest-service'
import { Block, KnownBlock } from '@slack/types'
import { DbLogger } from './use-db-logger'

export const attachShutdownHandler = (i: Injector) => {
  const logger = i.logger.withScope('shutdown-handler')
  const appName = i.getApplicationContext().name

  const onExit = async ({ code, reason, error }: { code: number; reason: string; error?: any }) => {
    process.removeAllListeners('exit')
    try {
      if (code) {
        await logger.warning({
          message: `Something bad happened, starting shutdown with code '${code}' due '${reason}'`,
          data: {
            code,
            reason,
            error,
            errorMessage: error?.message,
            errorStack: error?.stack,
            sendToSlack: true,
            blocks: [
              {
                type: 'header',
                text: {
                  type: 'plain_text',
                  text: `*${appName}* down 😢`,
                  emoji: true,
                },
              },
              {
                type: 'divider',
              },
              {
                type: 'section',
                text: {
                  type: 'mrkdwn',
                  text: `Something bad happened and *${appName}* has been terminated.`,
                },
              },
              {
                type: 'section',
                text: {
                  type: 'mrkdwn',
                  text: `Call stack: \`\`\`${JSON.stringify(
                    { stack: error?.stack, message: error?.message },
                    undefined,
                    2,
                  )}\`\`\``,
                },
              },
            ] as Array<Block | KnownBlock>,
          },
        })
      } else {
        await logger.information({
          message: `Shutting down gracefully due '${reason}'`,
          data: {
            code,
            reason,
            error,
            sendToSlack: true,
            blocks: [
              {
                type: 'header',
                text: {
                  type: 'plain_text',
                  text: `*${appName}* shutting down 🌜`,
                  emoji: true,
                },
              },
              {
                type: 'divider',
              },
              {
                type: 'section',
                text: {
                  type: 'mrkdwn',
                  text: `The service *${appName}* is shutting down gracefully due '${reason}'`,
                },
              },
            ] as Array<Block | KnownBlock>,
          },
        })
      }
      if (i.cachedSingletons.get(ServerManager)) {
        await i.getInstance(ServerManager).dispose()
      }
      if (i.cachedSingletons.get(DbLogger)) {
        await i.getInstance(DbLogger).dispose()
      }
      await i.dispose()
    } catch (e) {
      console.error('Error during shutdown', e)
      process.exit(1)
    }
    process.exit(code)
  }

  process.once('exit', () => onExit({ code: 0, reason: 'exit' }))

  // catches ctrl+c event
  process.once('SIGINT', () => onExit({ code: 0, reason: 'SIGINT' }))
  process.once('SIGQUIT', () => onExit({ code: 0, reason: 'SIGQUIT' }))
  process.once('SIGTERM', () => onExit({ code: 0, reason: 'SIGTERM' }))
  process.once('SIGKILL', () => onExit({ code: 0, reason: 'SIGKILL' }))

  // catches "kill pid" (for example: nodemon restart)
  process.once('SIGUSR1', () => onExit({ code: 0, reason: 'SIGUSR1' }))
  process.once('SIGUSR2', () => onExit({ code: 0, reason: 'SIGUSR2' }))

  // catches uncaught exceptions
  process.once('uncaughtException', (error) => {
    onExit({ code: 1, reason: 'uncaughtException', error })
  })

  process.once('unhandledRejection', (error) => onExit({ code: 1, reason: 'unhandledRejection', error }))
}
