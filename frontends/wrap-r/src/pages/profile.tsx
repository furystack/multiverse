import { createComponent, Shade } from '@furystack/shades'
import { Tabs, styles } from 'common-components'

export const ProfilePage = Shade({
  render: () => (
    <Tabs
      style={{ ...styles.glassBox, height: '100%', padding: '1em' }}
      tabs={[
        { header: <div>General info</div>, component: <div>General Info content</div> },
        { header: <div>Login and security</div>, component: <div>Login and security details</div> },
      ]}
    />
  ),
})
