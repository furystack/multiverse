import { Injectable, Injector } from '@furystack/inject'
import { AbstractLogger, getLogger, LeveledLogEntry, Logger, LogLevel, useLogging } from '@furystack/logging'
import { Block, KnownBlock, MessageAttachment } from '@slack/types'
import { IncomingWebhook } from '@slack/webhook'

export const getSlackIconForLogLevel = (level: LogLevel) => {
  switch (level) {
    case LogLevel.Debug:
      return ':beetle:'
    case LogLevel.Information:
      return ':information_source:'
    case LogLevel.Verbose:
      return ':bell:'
    case LogLevel.Warning:
      return ':warning:'
    case LogLevel.Error:
      return ':x:'
    case LogLevel.Fatal:
      return ':skull:'
    default:
      return ':question:'
  }
}

@Injectable({ lifetime: 'singleton' })
export class SlackLogger extends AbstractLogger implements Logger {
  /**
   *
   * @param entry The Entry object
   */
  public async addEntry(
    entry: LeveledLogEntry<any> & {
      sendToSlack?: boolean
      blocks?: Array<Block | KnownBlock>
      title?: string
      attachments?: MessageAttachment[]
      error?: Error
    },
  ): Promise<void> {
    const shouldSendToSlack = entry.data?.sendToSlack === true
    if (shouldSendToSlack) {
      await this.hook
        .send({
          ...(entry.data?.blocks
            ? { blocks: entry.data?.blocks }
            : {
                blocks: [
                  ...(entry.data?.title
                    ? [
                        {
                          type: 'header' as const,
                          text: { type: 'plain_text' as const, text: entry.data.title, emoji: true },
                        },
                      ]
                    : []),
                  {
                    type: 'context' as const,
                    elements: [
                      {
                        type: 'mrkdwn' as const,
                        text: entry.message,
                      },
                      ...(entry.data?.error
                        ? [
                            {
                              type: 'mrkdwn' as const,
                              text: `\`\`\` ${JSON.stringify(
                                { message: entry.data.error.message, stack: entry.data.error.stack },
                                undefined,
                                2,
                              )} \`\`\` `,
                            },
                          ]
                        : []),
                    ],
                  },
                  {
                    type: 'divider' as const,
                  },
                  {
                    type: 'context' as const,
                    elements: [
                      {
                        type: 'mrkdwn' as const,
                        text: `Level: ${LogLevel[entry.level]} ${getSlackIconForLogLevel(entry.level)}  Scope: ${
                          entry.scope
                        }`,
                      },
                    ],
                  },
                ],
              }),
          text: `${getSlackIconForLogLevel(entry.level)} entry.message`,
        })
        .catch((reason) => {
          this.warning({ scope: entry.scope, message: `Failed to send a Slack message`, data: { reason } }).catch(
            () => {
              /** */
            },
          )
        })
    }
  }

  /**
   *
   */
  constructor(private readonly hook: IncomingWebhook) {
    super()
  }
}

export const useSlackLogger = function (injector: Injector, slackUrl?: string) {
  if (!slackUrl) {
    getLogger(injector)
      .withScope('use-slack-logger')
      .warning({ message: `No Slack logger url configured, messages won't be distributed to Slack` })
  } else {
    const logger = new SlackLogger(new IncomingWebhook(slackUrl))
    injector.setExplicitInstance(logger, SlackLogger)
    useLogging(injector, SlackLogger)
  }
}
