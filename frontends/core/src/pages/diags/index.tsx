import { Shade, Router, createComponent, LazyLoad } from '@furystack/shades'
import { useDiagApi } from '@common/frontend-utils'
import { GenericErrorPage } from '../generic-error'
import { Init } from '../init'
import { SystemLogs } from './system-logs'
import { PatchList } from './patches/patch-list'
import { EntryDetails } from './system-logs/entry-details'
import { PatchDetails } from './patches/patch-details'

export const DiagsPage = Shade({
  shadowDomName: 'multiverse-diags-page',
  render: ({ injector }) => {
    return (
      <Router
        routes={[
          { url: '/diags/logs', component: () => <SystemLogs /> },
          {
            url: '/diags/logs/:logEntryId',
            component: ({ match }) => {
              return (
                <LazyLoad
                  error={(error, retry) => (
                    <GenericErrorPage
                      subtitle="Something bad happened during loading the log entry details"
                      error={error}
                      retry={retry}
                    />
                  )}
                  component={async () => {
                    const { logEntryId } = match.params
                    const { result } = await useDiagApi(injector)({
                      method: 'GET',
                      action: '/logEntries/:id',
                      url: { id: logEntryId },
                      query: {},
                    })
                    return <EntryDetails entry={result} />
                  }}
                  loader={<Init message="Loading Logs Details page..." />}
                />
              )
            },
          },
          { url: '/diags/patches', component: () => <PatchList /> },
          {
            url: '/diags/patches/:patchId',
            component: ({ match }) => {
              return (
                <LazyLoad
                  error={(error, retry) => (
                    <GenericErrorPage
                      subtitle="Something bad happened during loading the patch details"
                      error={error}
                      retry={retry}
                    />
                  )}
                  component={async () => {
                    const { patchId } = match.params
                    const { result } = await useDiagApi(injector)({
                      method: 'GET',
                      action: '/patches/:id',
                      url: { id: patchId },
                      query: {},
                    })
                    return <PatchDetails entry={result} />
                  }}
                  loader={<Init message="Loading Logs Details page..." />}
                />
              )
            },
          },
        ]}
      />
    )
  },
})
