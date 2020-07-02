import { PathHelper } from '@furystack/utils'
import { sites } from '@common/config'
import { CollectionService } from '@furystack/shades-common-components'
import { media } from '@common/models'

export class EncodingTaskProgressUpdater {
  public dispose() {
    this.socket.close()
  }

  private socket: WebSocket

  constructor(private readonly service: CollectionService<media.EncodingTask>) {
    this.socket = new WebSocket(
      PathHelper.joinPaths(
        sites.services.media.externalPath.replace('https://', 'wss://').replace('http://', 'ws://'),
        'media',
        'encoder-updates',
      ),
    )
    this.socket.onopen = () => console.log('WS opened')
    this.socket.onclose = () => console.log('WS closed')
    this.socket.onmessage = (msg) => {
      try {
        const messageData = JSON.parse(msg.data)
        const currentData = this.service.data.getValue()
        switch (messageData.event) {
          case 'encoding-task-added':
            this.service.data.setValue({
              count: currentData.count + 1,
              entries: [messageData.task as media.EncodingTask, ...currentData.entries],
            })
            break
          case 'encoding-task-updated':
            this.service.data.setValue({
              count: currentData.count,
              entries: currentData.entries.map((e) => {
                if (e._id === messageData.id) {
                  return { ...e, ...messageData.change }
                }
                return e
              }),
            })
            break
          default:
            break
        }
      } catch {
        /** */
      }
    }
  }
}
