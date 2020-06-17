import { Injectable, Injector } from '@furystack/inject'
import { sleepAsync } from '@furystack/utils'
import { messaging } from '@common/config'
import { connect, Connection, Channel, ConsumeMessage } from 'amqplib'
import { media } from '@common/models'
import { ScopedLogger } from '@furystack/logging'

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
    ;(this.channel as any).qos(1, false)
    await this.channel.assertExchange(messaging.media.fanoutExchange, 'fanout')
    await this.channel.assertQueue(messaging.media.queues.encodeVideo, { durable: true })
    await this.channel.bindQueue(
      messaging.media.queues.encodeVideo,
      messaging.media.fanoutExchange,
      messaging.media.routingKeys.movieAdded,
    )
    await this.channel.consume(messaging.media.queues.encodeVideo, (msg) => this.onEncodeVideo(msg), {
      noAck: false,
    })
    this.logger.verbose({ message: 'Started listening' })
  }

  private async onEncodeVideo(msg: ConsumeMessage | null) {
    if (msg) {
      const movie: media.Movie = JSON.parse(msg.content.toString())
      this.logger.verbose({ message: `Encoding task received for movie ${movie.metadata.title}`, data: { movie } })
      await sleepAsync(15000)
      this.logger.verbose({ message: `Finished encoding movie ${movie.metadata.title}`, data: { movie } })
      this.getChannel().ack(msg)
    }
  }

  private readonly logger: ScopedLogger

  constructor(injector: Injector) {
    this.logger = injector.logger.withScope('rabbit-listener')
    this.init()
  }
}
