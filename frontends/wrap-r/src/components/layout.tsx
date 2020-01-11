import { createComponent, Shade, Router } from '@furystack/shades'
import { GithubRegister } from '../pages/github-register'
import { GithubLogin } from '../pages/github-login'
import { Body } from './body'
import { Header } from './header'

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
        <Header title="🌀 Multiverse" links={[]} />
        <Router
          routeMatcher={(url, component) => url.pathname.startsWith(component)}
          notFound={() => <Body />}
          routes={[
            {
              url: '/github-login',
              component: currentUrl => <GithubLogin code={currentUrl.search.replace('?', '').split('=')[1]} />,
            },
            {
              url: '/github-register',
              component: currentUrl => <GithubRegister code={currentUrl.search.replace('?', '').split('=')[1]} />,
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
