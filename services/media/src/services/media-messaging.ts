import { Injectable } from '@furystack/inject'
import { messaging } from '@common/config'
import { media } from '@common/models'
import { connect, Connection, Channel } from 'amqplib'
import Semaphore from 'semaphore-async-await'

@Injectable({ lifetime: 'singleton' })
export class MediaMessaging {
  private connection?: Connection
  private channel?: Channel
  private initLock = new Semaphore(1)
  private isInitialized = false

  public getChannel() {
    if (!this.channel) {
      throw new Error('Messaging provider is not initialized yet!')
    }
    return this.channel
  }

  public async dispose() {
    /** */
    this.channel && this.channel.close()
  }

  public async onEncodeJobAdded(task: media.EncodingTask) {
    await this.init()
    await this.getChannel().publish(
      messaging.media.fanoutExchange,
      messaging.media.routingKeys.encodingJobAdded,
      Buffer.from(
        JSON.stringify({
          taskId: task._id,
          token: task.authToken,
        }),
      ),
      { persistent: true },
    )
  }

  private async init() {
    if (!this.isInitialized) {
      try {
        await this.initLock.acquire()
        if (!this.isInitialized) {
          this.connection = await connect(messaging.host, {})
          this.channel = await this.connection.createChannel()
          await this.channel.assertExchange(messaging.media.fanoutExchange, 'fanout')
          await this.channel.assertQueue(messaging.media.queues.encodeVideo, { durable: true })
          await this.channel.bindQueue(
            messaging.media.queues.encodeVideo,
            messaging.media.fanoutExchange,
            messaging.media.routingKeys.encodingJobAdded,
          )
        }
      } finally {
        this.initLock.release()
      }
    }
  }

  constructor() {
    this.init()
  }
}
