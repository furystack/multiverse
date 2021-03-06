import { Injectable, Injector } from '@furystack/inject'
import { messaging } from '@common/config'
import { media } from '@common/models'
import { connect, Connection, Channel } from 'amqplib'
import Semaphore from 'semaphore-async-await'
import { WebSocketApi } from '@furystack/websocket-api'

@Injectable({ lifetime: 'singleton' })
export class MediaMessaging {
  private connection?: Connection
  private channel?: Channel
  private initLock = new Semaphore(1)
  private isInitialized = false

  private onEncodeTaskAdded = this.injector
    .getDataSetFor(media.EncodingTask)
    .onEntityAdded.subscribe(async ({ injector, entity }) => {
      await this.init()
      await this.getChannel().publish(
        messaging.media.fanoutExchange,
        messaging.media.routingKeys.encodingJobAdded,
        Buffer.from(
          JSON.stringify({
            taskId: entity._id,
            token: entity.authToken,
          }),
        ),
        { persistent: true },
      )
      injector.getInstance(WebSocketApi).broadcast(async ({ injector: socketInjector, ws }) => {
        if (await socketInjector.isAuthorized('movie-admin')) {
          ws.send(JSON.stringify({ event: 'encoding-task-added', task: entity }))
        }
      })
    })

  private readonly onEncodeTaskUpdated = this.injector
    .getDataSetFor(media.EncodingTask)
    .onEntityUpdated.subscribe(({ injector, id, change }) => {
      injector.getInstance(WebSocketApi).broadcast(async ({ injector: socketInjector, ws }) => {
        if (await socketInjector.isAuthorized('movie-admin')) {
          ws.send(JSON.stringify({ event: 'encoding-task-updated', id, change }))
        }
      })
    })

  private readonly onEncodeTaskRemoved = this.injector
    .getDataSetFor(media.EncodingTask)
    .onEntityRemoved.subscribe(({ injector, key }) => {
      injector.getInstance(WebSocketApi).broadcast(async ({ injector: socketInjector, ws }) => {
        if (await socketInjector.isAuthorized('movie-admin')) {
          // ToDo: Check me
          ws.send(JSON.stringify({ event: 'encoding-task-updated', task: { _id: key } }))
        }
      })
    })

  public getChannel() {
    if (!this.channel) {
      throw new Error('Messaging provider is not initialized yet!')
    }
    return this.channel
  }

  public async dispose() {
    /** */
    this.channel && this.channel.close()
    this.onEncodeTaskAdded.dispose()
    this.onEncodeTaskUpdated.dispose()
    this.onEncodeTaskRemoved.dispose()
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

  constructor(private readonly injector: Injector) {
    this.init()
  }
}
