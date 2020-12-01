import { createComponent, Shade, Router, LazyLoad } from '@furystack/shades'
import { CommandPalette } from '@furystack/shades-common-components'
import { DocsPage } from '../pages/docs'
import { ContactPage } from '../pages/contact'
import { Init } from '../pages'
import { getCommandProviders } from '../services/command-providers'
import { GenericErrorPage } from '../pages/generic-error'
import { Body } from './body'
import { Header } from './header'
import { CurrentUserMenu } from './current-user-menu'

export const Layout = Shade({
  shadowDomName: 'shade-app-layout',
  render: () => {
    return (
      <div
        id="Layout"
        style={{
          position: 'fixed',
          top: '0',
          left: '0',
          width: '100%',
          height: '100%',
          backgroundImage: 'linear-gradient(to right bottom, #2b3036, #292c31, #27282d, #242428, #212023)',
          // backgroundColor: '#151515',
          // backgroundAttachment: 'fixed',
          // backgroundSize: 'cover',
          color: 'rgb(192,192,192)',
          display: 'flex',
          flexDirection: 'column',
          fontFamily: 'Arial, Helvetica, sans-serif',
          lineHeight: '1.6',
        }}
        className="eee">
        <Header>
          <CommandPalette style={{ marginRight: '1em' }} commandProviders={getCommandProviders()} defaultPrefix={'>'} />{' '}
          <CurrentUserMenu />
          <div style={{ width: '1em' }} />
        </Header>
        <Router
          routes={[
            /** If you needs routes with session dependency, use the <Body /> */
            {
              url: '/github-login',
              component: ({ currentUrl }) => (
                <LazyLoad
                  error={(error, retry) => (
                    <GenericErrorPage
                      subtitle="Something bad happened during loading the Github Login page"
                      error={error}
                      retry={retry}
                    />
                  )}
                  component={async () => {
                    const { GithubLogin } = await import(/* webpackChunkName: "github-login" */ '../pages/github/login')
                    return <GithubLogin code={currentUrl.search.replace('?', '').split('=')[1]} />
                  }}
                  loader={<Init message="Loading Github Login..." />}
                />
              ),
            },
            {
              url: '/github-register',
              component: ({ currentUrl }) => (
                <LazyLoad
                  error={(error, retry) => (
                    <GenericErrorPage
                      subtitle="Something bad happened during loading the Github Registration page"
                      error={error}
                      retry={retry}
                    />
                  )}
                  component={async () => {
                    const { GithubRegister } = await import(
                      /* webpackChunkName: "github-register" */ '../pages/github/register'
                    )
                    return <GithubRegister code={currentUrl.search.replace('?', '').split('=')[1]} />
                  }}
                  loader={<Init message="Loading Github Registration..." />}
                />
              ),
            },
            {
              url: '/github-attach',
              component: ({ currentUrl }) => (
                <LazyLoad
                  error={(error, retry) => (
                    <GenericErrorPage
                      subtitle="Something bad happened during loading the Github Attach page"
                      error={error}
                      retry={retry}
                    />
                  )}
                  component={async () => {
                    const { GithubAttach } = await import(
                      /* webpackChunkName: "github-register" */ '../pages/github/attach'
                    )
                    return <GithubAttach code={currentUrl.search.replace('?', '').split('=')[1]} />
                  }}
                  loader={<Init message="Loading Github Attach..." />}
                />
              ),
            },
            {
              url: '/contact',
              component: () => <ContactPage />,
            },
            {
              url: '/docs',
              component: () => <DocsPage />,
            },
            {
              url: '/',
              component: () => <Body />,
              routingOptions: { end: false },
            },
          ]}
        />
      </div>
    )
  },
})
