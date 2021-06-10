import { Injector } from '@furystack/inject'
import { AbstractLogger, LeveledLogEntry, Logger } from '@furystack/logging'
import { Block, KnownBlock, MessageAttachment } from '@slack/types'
import { IncomingWebhook } from '@slack/webhook'

export class SlackLogger extends AbstractLogger implements Logger {
  /**
   *
   * @param entry The Entry object
   */
  public async addEntry<
    T extends { sendToSlack?: boolean; blocks?: Array<Block | KnownBlock>; attachments?: MessageAttachment[] },
  >(entry: LeveledLogEntry<T>): Promise<void> {
    const shouldSendToSlack = entry.data?.sendToSlack === true
    if (shouldSendToSlack) {
      try {
        await this.hook.send({
          ...(entry.data?.blocks ? { blocks: entry.data?.blocks } : {}),
          ...(entry.data?.attachments ? { attachments: entry.data?.attachments } : {}),
          ...(!entry.data?.blocks ? { text: entry.message } : {}),
        })
      } catch (error) {
        await this.warning({ scope: entry.scope, message: `Failed to send a Slack message`, data: { error } }).catch(
          () => {
            /** */
          },
        )
      }
    }
  }

  /**
   *
   */
  constructor(private readonly hook: IncomingWebhook) {
    super()
  }
}

declare module '@furystack/inject/dist/injector' {
  // eslint-disable-next-line no-shadow
  interface Injector {
    useSlackLogger: (slackUrl?: string) => Injector
  }
}

Injector.prototype.useSlackLogger = function (slackUrl?: string) {
  if (!slackUrl) {
    this.logger
      .withScope('use-slack-logger')
      .warning({ message: `No Slack logger url configured, messages won't be distributed to Slack` })
    return this
  }

  const logger = new SlackLogger(new IncomingWebhook(slackUrl))
  this.setExplicitInstance(logger, SlackLogger)

  this.useLogging(SlackLogger)

  return this
}
