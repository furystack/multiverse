import { Injectable } from '@furystack/inject'
import { messaging } from '@common/config'
import { media } from '@common/models'
import { connect, Connection, Channel } from 'amqplib'

@Injectable({ lifetime: 'singleton' })
export class MediaMessaging {
  private connection?: Connection
  private channel?: Channel

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

  public async onMovieAdded(movie: media.Movie) {
    await this.getChannel().publish(
      messaging.media.fanoutExchange,
      messaging.media.routingKeys.movieAdded,
      Buffer.from(JSON.stringify(movie)),
      { persistent: true },
    )
  }

  private async init() {
    this.connection = await connect(messaging.host)
    this.channel = await this.connection.createChannel()
    await this.channel.assertExchange(messaging.media.fanoutExchange, 'fanout')
    await this.channel.assertQueue(messaging.media.queues.encodeVideo, { durable: true })
    await this.channel.bindQueue(
      messaging.media.queues.encodeVideo,
      messaging.media.fanoutExchange,
      messaging.media.routingKeys.movieAdded,
    )
  }

  constructor() {
    this.init()
  }
}
