import { Injectable, Injector } from '@furystack/inject'
import { messaging } from '@common/config'
import { connect, Connection, Channel, ConsumeMessage } from 'amqplib'
import { media } from '@common/models'
import { ScopedLogger } from '@furystack/logging'
import { encodeTask } from '../processes/encode-task'

@Injectable({ lifetime: 'singleton' })
export class RabbitListener {
  private connection?: Connection
  private channel?: Channel

  public getChannel() {
    if (!this.channel) {
      throw new Error('Messaging provider is not initialized yet!')
    }
    return this.channel
  }

  private async init() {
    this.connection = await connect(messaging.host)
    this.channel = await this.connection.createChannel()
    await (this.channel as any).qos(1, false)
    await this.channel.assertExchange(messaging.media.fanoutExchange, 'fanout')
    await this.channel.assertQueue(messaging.media.queues.encodeVideo, { durable: true })
    await this.channel.bindQueue(
      messaging.media.queues.encodeVideo,
      messaging.media.fanoutExchange,
      messaging.media.routingKeys.encodingJobAdded,
    )
    await this.channel.consume(messaging.media.queues.encodeVideo, (msg) => this.onEncodeVideo(msg), {
      noAck: false,
    })
    this.logger.verbose({ message: 'Started listening' })
  }

  private async onEncodeVideo(msg: ConsumeMessage | null) {
    if (msg) {
      const task: media.EncodingTask = JSON.parse(msg.content.toString())
      this.logger.verbose({
        message: `Encoding task received for movie ${task.mediaInfo.movie.metadata.title}`,
        data: { task },
      })
      await encodeTask({ task, injector: this.injector })
      this.logger.verbose({ message: `Finished encoding movie ${task.mediaInfo.movie.metadata.title}`, data: { task } })
      this.getChannel().ack(msg)
    }
  }

  private readonly logger: ScopedLogger

  constructor(private readonly injector: Injector) {
    this.logger = injector.logger.withScope('rabbit-listener')
    this.init()
  }
}
