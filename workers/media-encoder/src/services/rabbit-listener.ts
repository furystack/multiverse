import { Injectable, Injected, Injector } from '@furystack/inject'
import { sleepAsync } from '@furystack/utils'
import { messaging } from '@common/config'
import type { Connection, Channel, ConsumeMessage } from 'amqplib'
import { connect } from 'amqplib'
import type { ScopedLogger } from '@furystack/logging'
import { getLogger } from '@furystack/logging'
import Semaphore from 'semaphore-async-await'
import { encodeTask } from '../processes/encode-task'
import { loadTaskDetails } from '../processes/load-task-details'

@Injectable({ lifetime: 'singleton' })
export class RabbitListener {
  @Injected(Injector)
  private readonly injector!: Injector

  private connection?: Connection
  private channel?: Channel
  private initLock = new Semaphore(1)

  public getChannel() {
    if (!this.channel) {
      throw new Error('Messaging provider is not initialized yet!')
    }
    return this.channel
  }

  public async dispose() {
    await this.connection?.close()
  }

  private logger!: ScopedLogger

  public async init() {
    this.logger = getLogger(this.injector).withScope('rabbit-listener')
    try {
      await this.initLock.acquire()
      this.connection = await connect(messaging.host)
      this.channel = await this.connection.createChannel()
      await this.channel.assertExchange(messaging.media.fanoutExchange, 'fanout')
      await this.channel.assertQueue(messaging.media.queues.encodeVideo, { durable: true })
      await this.channel.bindQueue(
        messaging.media.queues.encodeVideo,
        messaging.media.fanoutExchange,
        messaging.media.routingKeys.encodingJobAdded,
      )
      this.channel.prefetch(1, false)
      await this.channel.consume(messaging.media.queues.encodeVideo, (msg) => this.onEncodeVideo(msg), {
        noAck: false,
      })
      this.initLock.release()
    } catch (error) {
      await this.logger.warning({
        message: 'There was an error during RabbitMQ connection. Will retry in 30s',
        data: { error },
      })
      await sleepAsync(1000 * 30)
      this.initLock.release()
      this.init()
    }
    await this.logger.verbose({ message: 'Started listening' })
  }

  private async onEncodeVideo(msg: ConsumeMessage | null) {
    if (msg) {
      await this.logger.verbose({
        message: `Task message received, loading task details...`,
      })
      const { taskId, token } = JSON.parse(msg.content.toString())

      loadTaskDetails({ taskId, token })
        .then(async (task) => {
          await this.logger.verbose({
            message: `Encoding task loaded for movie ${task.mediaInfo.movie.metadata.title}`,
            data: { task },
          })
          const success = await encodeTask({ task, injector: this.injector })
          success ? this.getChannel().ack(msg) : this.getChannel().nack(msg, undefined, false)
        })
        .catch(async (reason) => {
          if (reason.code === 'ECONNREFUSED') {
            await this.logger.warning({
              message: 'The Service seems to be offline. The task will be re-queued in a minute.',
              data: { reason },
            })
            await sleepAsync(60 * 1000)
            this.getChannel().nack(msg, undefined, true)
          } else if (reason.name === 'HTTPError' && reason.message === 'Response code 401 (Unauthorized)') {
            await this.logger.warning({
              message: 'The token is invalid. The message will not be re-queued',
              data: { reason },
            })
            this.getChannel().nack(msg, undefined, false)
          } else {
            await this.logger.warning({
              message: `Failed to retrieve task details, reason:${reason.code}`,
              data: { reason },
            })
          }
        })
    }
  }
}
