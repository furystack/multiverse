import { Shade, LazyLoad, createComponent } from '@furystack/shades'
import { dashboard } from '@common/models'
import { useDashboardApi, useMediaApi } from '@common/frontend-utils'
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
            const { result: board } = await useDashboardApi(injector)({
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
            const { result: movie } = await useMediaApi(injector)({
              method: 'GET',
              action: '/movies/:id',
              url: { id: props.id },
              query: {},
            })
            return <MovieWidget index={props.index} movie={movie} size={256} />
          }
          if (props.entityType === 'movie-library') {
            const { result: movieLib } = await useMediaApi(injector)({
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

          return <BrokenWidget message={`Entity type '${props.entityType}' not found`} widgetData={props} />
        }}
      />
    )
  },
})
