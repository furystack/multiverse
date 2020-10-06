import { createComponent, RouteLink, Shade, Router } from '@furystack/shades'
import { AppBar, animations } from '@furystack/shades-common-components'
import { serviceList } from '@common/models'
import { Icon } from './icon'
export const Header = Shade({
  shadowDomName: 'shade-app-header',
  render: ({ children }) => {
    return (
      <AppBar>
        <h3
          style={{
            margin: '0 2em 0 0',
            color: '#aaa',
            textDecoration: 'none',
            fontFamily: '"Lucida Console", Monaco, monospace',
            whiteSpace: 'nowrap',
            textOverflow: 'ellipsis',
            display: 'flex',
            lineHeight: '50px',
          }}>
          <RouteLink
            title="Multiverse"
            href="/"
            style={{
              marginRight: '1em',
              cursor: 'pointer',
              placeContent: 'center',
              display: 'flex',
            }}>
            <img src="/static/galaxy.png" alt="Multiverse Logo" style={{ marginRight: '1em' }} />
            <div>Multiverse</div>
          </RouteLink>
          <Router
            notFound={() => <div />}
            routes={serviceList.map((s) => ({
              url: s.url,
              routingOptions: { end: false },
              onVisit: animations.showSlide,
              onLeave: animations.hideSlide,
              component: () => (
                <RouteLink style={{ display: 'inline-flex' }} href={s.url}>
                  -{' '}
                  <Icon icon={s.icon} elementProps={{ style: { height: '100%', margin: '0px 13px', width: '28px' } }} />{' '}
                  {s.name}
                </RouteLink>
              ),
            }))}
          />
        </h3>
        {children}
      </AppBar>
    )
  },
})
