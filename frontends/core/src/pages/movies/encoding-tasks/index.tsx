import { Shade, createComponent, RouteLink } from '@furystack/shades'
import type { media } from '@common/models'
import { Button, CollectionService, DataGrid } from '@furystack/shades-common-components'
import { useMediaApi } from '@common/frontend-utils'
import { EncodingTaskProgressUpdater } from '../../../services/encoding-task-progress-updater'

export interface EncodingTaskState {
  service: CollectionService<media.EncodingTask>
  taskUpdater: EncodingTaskProgressUpdater
}

export const EncodingTasks = Shade<{}, EncodingTaskState>({
  shadowDomName: 'encoding-tasks',
  getInitialState: ({ injector }) => {
    const service = new CollectionService<media.EncodingTask>({
      loader: async (findOptions) => {
        const response = await useMediaApi(injector)({
          method: 'GET',
          action: '/encode/tasks',
          query: {
            findOptions: {
              ...findOptions,
              select: ['_id', 'mediaInfo', 'status', 'startDate', 'creationDate', 'finishDate', 'percent'],
            },
          },
        })
        return response.result
      },
      defaultSettings: { order: { creationDate: 'DESC' } },
    })

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
          columns={['mediaInfo', 'status', 'percent', 'creationDate']}
          service={getState().service}
          styles={{
            cell: {
              textAlign: 'center',
              textOverflow: 'ellipsis',
              overflow: 'hidden',
              position: 'relative',
            },
            wrapper: { background: 'rgba(128,128,128,0.03)' },
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
                <div style={{ textAlign: 'left' }}>
                  <RouteLink href={`/movies/overview/${entry.mediaInfo.movie._id}`}>
                    <h1 style={{ fontSize: '18px', margin: '0' }}>{entry.mediaInfo.movie.metadata.title}</h1>
                  </RouteLink>
                  <div style={{ fontSize: '14px', whiteSpace: 'nowrap' }}>
                    <span
                      style={{ cursor: 'pointer' }}
                      onclick={(ev) => {
                        ev.preventDefault()
                        ev.stopImmediatePropagation()
                        if (confirm('Re-encoding takes a lot of time. Are you sure?')) {
                          useMediaApi(injector)({
                            method: 'POST',
                            action: '/encode/reencode',
                            body: { movieId: entry.mediaInfo.movie._id },
                          })
                        }
                      }}
                      title="Re-encode"
                    >
                      <Button>Re-encode</Button>
                    </span>
                    <RouteLink href={`/movies/encoding-tasks/${entry._id}`}>
                      <Button>Task details</Button>
                    </RouteLink>
                    <RouteLink href={`/movies/${entry.mediaInfo.library._id}/edit/${entry.mediaInfo.movie._id}`}>
                      <Button>Edit movie</Button>
                    </RouteLink>
                    <Button
                      onclick={() => {
                        if (confirm('Really delete task?')) {
                          useMediaApi(injector)({
                            method: 'DELETE',
                            action: '/encode/tasks/:id',
                            url: {
                              id: entry._id,
                            },
                          })
                        }
                      }}
                    >
                      Delete
                    </Button>
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
                  }}
                >
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
                  boxShadow: '0 0 0px 1px inset rgba(128,128,128,0.5)',
                }}
              >
                <div
                  style={{
                    position: 'absolute',
                    top: '5px',
                    left: '5px',
                    height: 'calc(100% - 10px)',
                    width: `calc(${entry.percent.toString()}% - 10px)`,
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
            creationDate: (entry) => {
              return (
                <div
                  style={{
                    position: 'absolute',
                    top: '0',
                    left: '0',
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexDirection: 'column',
                    fontSize: '14px',
                  }}
                >
                  <div>
                    Created at <strong>{entry.creationDate}</strong>
                  </div>
                  {entry.startDate ? (
                    <div>
                      Task duration: {entry.startDate} - {entry.finishDate || '?'}
                    </div>
                  ) : null}
                </div>
              )
            },
          }}
        />
      </div>
    )
  },
})
