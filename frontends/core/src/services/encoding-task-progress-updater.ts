import { PathHelper } from '@furystack/utils'
import { sites } from '@common/config'
import type { CollectionService } from '@furystack/shades-common-components'
import type { media } from '@common/models'

export class EncodingTaskProgressUpdater {
  public dispose() {
    this.socket.close()
  }

  private socket: WebSocket

  constructor(private readonly service: CollectionService<media.EncodingTask>) {
    this.socket = new WebSocket(
      PathHelper.joinPaths(location.origin, sites.services.media.apiPath, 'encoder-updates')
        .replace('https://', 'wss://')
        .replace('http://', 'ws://'),
    )
    this.socket.onopen = () => console.log('WS opened')
    this.socket.onclose = () => console.log('WS closed')
    this.socket.onmessage = (msg) => {
      try {
        const messageData = JSON.parse(msg.data)
        const currentData = this.service.data.getValue()
        const taskToUpdate = messageData.task as media.EncodingTask
        switch (messageData.event) {
          case 'update':
            currentData.entries.some((task) => task._id === taskToUpdate._id)
              ? this.service.data.setValue({
                  count: currentData.count,
                  entries: currentData.entries.map((e) => {
                    if (e._id === taskToUpdate._id) {
                      return {
                        ...e,
                        ...taskToUpdate,
                      }
                    }
                    return e
                  }),
                })
              : this.service.data.setValue({
                  count: currentData.count + 1,
                  entries: [taskToUpdate, ...currentData.entries],
                })
            break
          case 'remove':
            this.service.data.setValue({
              count: currentData.count - 1,
              entries: currentData.entries.filter((e) => e._id !== messageData.taskId),
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
