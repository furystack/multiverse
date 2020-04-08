import { Shade, createComponent } from '@furystack/shades'
import { styles } from '@common/components'

export const Page404 = Shade({
  shadowDomName: 'shade-404-not-found',
  render: () => {
    return (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          height: '100%',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '0 100px',
        }}>
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            perspective: '400px',
            animation: 'shake 150ms 2 linear',
            padding: '3em',
            ...styles.glassBox,
          }}>
          <h1 style={{ marginTop: '0' }}>WhoOoOops... 😱</h1>
          <h3>The page you are looking for is not exists 😓</h3>
          <p>
            It seems to be the page you are looking for is missing or you does not have a permission to see it... You
            can check the following things:
          </p>
          <ul>
            <li>The URL above is correct.</li>
            <li>You have logged in</li>
            <li>You have the neccessary permissions</li>
          </ul>
          <div style={{ textAlign: 'center' }}>
            <a href="/" style={{ color: 'white' }}>
              Reload page
            </a>
          </div>
        </div>
      </div>
    )
  },
})
