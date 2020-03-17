import { Shade, createComponent, PartialElement } from '@furystack/shades'
import { User } from 'common-models'

export type AvatarProps = { user: User } & PartialElement<HTMLDivElement>

export const Avatar = Shade<AvatarProps>({
  shadowDomName: 'shade-avatar',
  render: ({ props }) => {
    const { user, ...divProps } = props
    return (
      <div
        {...divProps}
        style={{
          width: '100%',
          height: '100%',
          overflow: 'hidden',
          borderRadius: '50%',
          boxShadow: '0px 0px 8px 3px rgba(128,128,128,0.2)',
          backgroundColor: 'rgba(128,128,128,0.3)',
          ...(props.style || {}),
        }}>
        {props.user.avatarUrl ? (
          <img style={{ width: '100%', height: '100%' }} alt={props.user.username} src={props.user.avatarUrl} />
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
            <div
              style={{
                fontVariant: 'all-petite-caps',
                fontSize: '2em',
                height: 'calc(100% + 7px)',
                cursor: 'default',
                userSelect: 'none',
              }}>
              {props.user.username[0]}
            </div>
          </div>
        )}{' '}
      </div>
    )
  },
})
