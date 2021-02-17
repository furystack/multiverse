import { Shade, LazyLoad, createComponent } from '@furystack/shades'
import { dashboard, media, xpense } from '@common/models'
import { DashboardApiService, MediaApiService, XpenseApiService } from '@common/frontend-utils'
import { Init } from '../../pages'
import { IconUrlWidget } from './icon-url-widget'
import { BrokenWidget } from './broken-widget'
import { MovieWidget } from './movie-widget'

export const EntityShortcutWidget = Shade<dashboard.EntityShortcutWidget & { index: number }>({
  shadowDomName: 'entity-shortcut-widget',
  render: ({ props, injector }) => {
    return (
      <LazyLoad
        loader={<Init message="Loading Widget" />}
        error={(error) => <BrokenWidget widgetData={{ props, error }} message={'Failed to display widget'} />}
        component={async () => {
          if (props.entityType === 'dashboard') {
            const board: dashboard.Dashboard = await injector.getInstance(DashboardApiService).call({
              method: 'GET',
              action: '/boards/:id',
              url: { id: props.id },
              query: {},
            })
            return (
              <IconUrlWidget
                index={props.index}
                icon={props.icon || '📋'}
                name={props.name || board.name}
                description={board.description}
                url={`/dashboard/view/${props.id}`}
              />
            )
          }
          if (props.entityType === 'movie') {
            const movie: media.Movie = await injector.getInstance(MediaApiService).call({
              method: 'GET',
              action: '/movies/:id',
              url: { id: props.id },
              query: {},
            })
            return <MovieWidget index={props.index} movie={movie} size={256} />
          }
          if (props.entityType === 'movie-library') {
            const movieLib: media.MovieLibrary = await injector.getInstance(MediaApiService).call({
              method: 'GET',
              action: '/movie-libraries/:id',
              url: { id: props.id },
              query: {},
            })
            return (
              <IconUrlWidget
                index={props.index}
                icon={props.icon || movieLib.icon || '📋'}
                name={props.name || movieLib.name}
                url={`/movies/${props.id}`}
              />
            )
          }

          if (props.entityType === 'xpense-account') {
            const account: xpense.Account = await injector.getInstance(XpenseApiService).call({
              method: 'GET',
              action: '/accounts/:id',
              url: { id: props.id },
              query: {},
            })
            return (
              <IconUrlWidget
                index={props.index}
                icon={props.icon || account.icon}
                name={account.name}
                description={account.description}
                url={`/xpense/${account._id}`}
              />
            )
          }

          return <BrokenWidget message={`Entity type '${props.entityType}' not found`} widgetData={props} />
        }}
      />
    )
  },
})
