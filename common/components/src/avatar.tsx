import { Shade, createComponent, PartialElement } from '@furystack/shades'
import { PathHelper } from '@furystack/utils'
import { sites } from 'common-config'

export type AvatarPropsUsername = { userName: string } & PartialElement<HTMLDivElement>
export type AvatarPropsUrl = { avatarUrl: string } & PartialElement<HTMLDivElement>

export type AvatarProps = AvatarPropsUsername | AvatarPropsUrl

export const p: AvatarProps = {
  userName: 'anyád',
}

export const isUsernameProps = (obj: AvatarProps): obj is AvatarPropsUsername => {
  return (obj as any).userName ? true : false
}

export const Avatar = Shade<AvatarProps>({
  shadowDomName: 'shade-avatar',
  render: ({ props }) => {
    const { ...divProps } = props
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
        <img
          style={{ width: '100%', height: '100%' }}
          alt={isUsernameProps(props) ? props.userName : 'unknown avatar'}
          src={
            isUsernameProps(props)
              ? PathHelper.joinPaths(
                  sites.services['wrap-r'].externalPath,
                  'wrap-r',
                  'profiles',
                  props.userName,
                  'avatar',
                )
              : props.avatarUrl
          }
          onerror={(ev) => {
            ;((ev as Event).target as HTMLImageElement).replaceWith(
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                <div
                  style={{
                    fontVariant: 'all-petite-caps',
                    fontSize: '2em',
                    height: 'calc(100% + 7px)',
                    cursor: 'default',
                    userSelect: 'none',
                  }}>
                  {isUsernameProps(props) ? props.userName[0] : 'X'}
                </div>
              </div>,
            )
          }}
        />
      </div>
    )
  },
})
