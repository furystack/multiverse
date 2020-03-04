import { createComponent, Shade, Router, LazyLoad } from '@furystack/shades'
import { DocsPage } from '../pages/docs'
import { ContactPage } from '../pages/contact'
import { Body } from './body'
import { Header } from './header'
import { CurrentUserMenu } from './current-user-menu'
import { Loader } from './loader'

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
          background: '#dedede',
          display: 'flex',
          flexDirection: 'column',
          fontFamily: 'Arial, Helvetica, sans-serif',
          lineHeight: '1.6',
        }}
        className="eee">
        <Header>
          <div style={{ flex: '1' }} />
          <CurrentUserMenu />
          <div style={{ width: '1em' }} />
        </Header>
        <Router
          routeMatcher={(url, component) => url.pathname.startsWith(component)}
          notFound={() => <Body />}
          routes={[
            /** If you needs routes with session dependency, use the <Body /> */
            {
              url: '/github-login',
              component: currentUrl => (
                <LazyLoad
                  component={async () => {
                    const { GithubLogin } = await import(/* webpackChunkName: "github-login" */ '../pages/github-login')
                    return <GithubLogin code={currentUrl.search.replace('?', '').split('=')[1]} />
                  }}
                  loader={<Loader />}
                />
              ),
            },
            {
              url: '/github-register',
              component: currentUrl => (
                <LazyLoad
                  component={async () => {
                    const { GithubRegister } = await import(
                      /* webpackChunkName: "github-register" */ '../pages/github-register'
                    )
                    return <GithubRegister code={currentUrl.search.replace('?', '').split('=')[1]} />
                  }}
                  loader={<Loader />}
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
            },
          ]}
        />
      </div>
    )
  },
})
