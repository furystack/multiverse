import { Shade, createComponent, PartialElement } from '@furystack/shades'
import { promisifyAnimation } from 'common-frontend-utils/src'

const defaultStyle: PartialElement<CSSStyleDeclaration> = {
  background: 'rgba(255, 255, 255, 0.6)',
  border: '1px solid rgba(0, 0, 0, 0.3)',
  padding: '12px 20px',
  transition: 'background .41s linear',
  borderRadius: '3px',
  fontWeight: 'bolder',
  fontVariant: 'all-petite-caps',
  color: '#333',
  backdropFilter: 'blur(2px)',
  // boxShadow: 'inset 0px 0px 26px 0px rgba(0,0,0,.2), 4px 4px 9px rgba(0,0,0,0.21)',
}

export const Button = Shade<PartialElement<HTMLButtonElement>>({
  shadowDomName: 'shade-button',
  render: ({ props, children }) => {
    return (
      <button
        onmouseenter={(ev) => {
          {
            promisifyAnimation(
              ev.target as any,
              [{ background: defaultStyle.background }, { background: 'rgba(255,255,255,0.9)' }],
              { duration: 500, fill: 'forwards', easing: 'cubic-bezier(0.215, 0.610, 0.355, 1.000)' },
            )
          }
        }}
        onmouseleave={(ev) => {
          promisifyAnimation(
            ev.target as any,
            [{ background: 'rgba(255,255,255,0.9)' }, { background: defaultStyle.background }],
            {
              duration: 500,
              fill: 'forwards',
              easing: 'cubic-bezier(0.215, 0.610, 0.355, 1.000)',
            },
          )
        }}
        {...props}
        style={{
          ...defaultStyle,
          cursor: props.disabled ? 'inherits' : 'pointer',
          ...props.style,
        }}>
        {children}
      </button>
    )
  },
})
