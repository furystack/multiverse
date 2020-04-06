import { Shade, createComponent } from '@furystack/shades'
import { styles } from 'common-components'
import { xpense } from 'common-models'

export const XpenseShoppingPage = Shade<xpense.Account>({
  shadowDomName: 'xpense-shopping-page',
  render: ({ props }) => {
    return (
      <div style={{ ...styles.glassBox }}>
        <h3 style={{ padding: '0 2em', fontVariant: 'all-petite-caps' }}>
          <strong>Shopping - {props.name}</strong>{' '}
          <span style={{ marginLeft: '1em' }}>Balance: ${props.current.toString()}</span>
        </h3>
        <div style={{ flex: '1' }} />
      </div>
    )
  },
})
