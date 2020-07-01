import { Shade, createComponent, RouteLink } from '@furystack/shades'
import { media } from '@common/models'
import { CollectionService, DataGrid, styles } from '@furystack/shades-common-components'
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
              position: 'relative',
            },
            wrapper: styles.glassBox,
          }}
          headerComponents={{}}
          rowComponents={{
            mediaInfo: (entry) => (
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <img
                  alt={entry.mediaInfo.movie.metadata.title}
                  src={entry.mediaInfo.movie.metadata.thumbnailImageUrl}
                  style={{ width: '50px', marginRight: '0.5em' }}
                />
                <div>
                  <h1 style={{ fontSize: '18px', margin: '0' }}>{entry.mediaInfo.movie.metadata.title} </h1>
                  <div style={{ textAlign: 'left' }}>
                    <span
                      style={{ cursor: 'pointer' }}
                      onclick={(ev) => {
                        ev.preventDefault()
                        ev.stopImmediatePropagation()
                        if (confirm('Re-encoding takes a lot of time. Are you sure?')) {
                          injector.getInstance(MediaApiService).call({
                            method: 'POST',
                            action: '/encode/reencode',
                            body: { movieId: entry.mediaInfo.movie._id },
                          })
                        }
                      }}
                      title="Re-encode">
                      Re-encode
                    </span>{' '}
                    |{' '}
                    <RouteLink href={`/movies/${entry.mediaInfo.library._id}/edit/${entry.mediaInfo.movie._id}`}>
                      Edit
                    </RouteLink>
                  </div>
                </div>
              </div>
            ),
            status: (entry) => {
              return (
                <div
                  style={{
                    display: 'flex',
                    position: 'absolute',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '2em',
                    width: '100%',
                    height: '100%',
                    top: '0',
                    left: '0',
                  }}>
                  {entry.status === 'pending' ? (
                    <span title="pending">⏳</span>
                  ) : entry.status === 'inProgress' ? (
                    <span title="In Progress">📽</span>
                  ) : entry.status === 'cancelled' ? (
                    <span title="Cancelled">🤚</span>
                  ) : entry.status === 'failed' ? (
                    <span title="Failed">🛑</span>
                  ) : entry.status === 'finished' ? (
                    <span title="Finished">✔</span>
                  ) : null}
                </div>
              )
            },
            percent: (entry) => (
              <div
                style={{
                  display: 'flex',
                  position: 'absolute',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '2em',
                  width: '100%',
                  height: '100%',
                  top: '0',
                  left: '0',
                }}>
                <div
                  style={{
                    position: 'absolute',
                    top: '0',
                    left: '0',
                    height: '100%',
                    width: `${entry.percent.toString()}%`,
                    background:
                      entry.status === 'inProgress'
                        ? 'rgba(128,128,222,0.15)'
                        : entry.status === 'failed'
                        ? 'rgba(222,128,128,0.10)'
                        : 'rgba(255,255,255,0.05)',
                  }}
                />
                {entry.percent.toString()}%
              </div>
            ),
          }}
        />
      </div>
    )
  },
})
