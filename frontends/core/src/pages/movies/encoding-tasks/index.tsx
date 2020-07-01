import { Shade, createComponent } from '@furystack/shades'
import { media } from '@common/models'
import { CollectionService, DataGrid, styles, Button } from '@furystack/shades-common-components'
import { MediaApiService } from '@common/frontend-utils'
import { EncodingTaskProgressUpdater } from '../../../services/encoding-task-progress-updater'

export interface EncodingTaskState {
  service: CollectionService<media.EncodingTask>
  taskUpdater: EncodingTaskProgressUpdater
}

export const EncodingTasks = Shade<{}, EncodingTaskState>({
  shadowDomName: 'encoding-tasks',
  getInitialState: ({ injector }) => {
    const service = new CollectionService<media.EncodingTask>(
      (findOptions) =>
        injector.getInstance(MediaApiService).call({
          method: 'GET',
          action: '/encode/tasks',
          query: { findOptions },
        }),
      { top: 20, order: { creationDate: 'DESC' } },
    )
    const taskUpdater = new EncodingTaskProgressUpdater(service)
    return {
      service,
      taskUpdater,
    }
  },
  constructed: ({ getState }) => {
    return () => getState().taskUpdater.dispose()
  },
  render: ({ getState, injector }) => {
    return (
      <div style={{ width: '100%', height: '100%' }}>
        <DataGrid<media.EncodingTask>
          columns={['mediaInfo', 'status', 'percent', 'startDate', 'finishDate']}
          service={getState().service}
          styles={{
            cell: {
              textAlign: 'center',
              textOverflow: 'ellipsis',
              overflow: 'hidden',
            },
            wrapper: styles.glassBox,
          }}
          headerComponents={{
            mediaInfo: () => <span>Movie title</span>,
            percent: () => <span>Progress</span>,
          }}
          rowComponents={{
            mediaInfo: (entry) => (
              <div>
                {entry.mediaInfo.movie.metadata.title}{' '}
                <Button
                  onclick={() => {
                    if (confirm('Re-encoding takes a lot of time. Are you sure?')) {
                      injector.getInstance(MediaApiService).call({
                        method: 'POST',
                        action: '/encode/reencode',
                        body: { movieId: entry.mediaInfo.movie._id },
                      })
                    }
                  }}>
                  Re-encode
                </Button>{' '}
              </div>
            ),
            percent: (entry) => <span>{entry.percent.toString()}%</span>,
          }}
        />
      </div>
    )
  },
})
