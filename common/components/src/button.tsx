import { Shade, createComponent, PartialElement } from '@furystack/shades'
import { promisifyAnimation } from 'common-frontend-utils/src'
import { colors } from './styles'

const getDefaultStyle: (props: ButtonProps) => PartialElement<CSSStyleDeclaration> = (props) => ({
  background: props.variant
    ? props.variant === 'primary'
      ? colors.primary.main
      : colors.secondary.main
    : 'rgb(128, 128, 128)',
  border: '1px solid rgba(0, 0, 0, 0.3)',
  padding: '12px 20px',
  transition: 'background .41s linear',
  borderRadius: '3px',
  fontWeight: 'bolder',
  fontVariant: 'all-petite-caps',
  color: props.variant
    ? props.variant === 'primary'
      ? colors.primary.contrastText
      : colors.secondary.contrastText
    : '#333',
})

const getHoverStyle: (props: ButtonProps) => PartialElement<CSSStyleDeclaration> = (props) => ({
  background: props.variant
    ? props.variant === 'primary'
      ? colors.primary.light
      : colors.secondary.light
    : 'rgb(156,156,156)',
})

export interface ButtonProps {
  variant?: 'primary' | 'secondary'
}

export const Button = Shade<PartialElement<HTMLButtonElement> & ButtonProps>({
  shadowDomName: 'shade-button',
  render: ({ props, children }) => {
    const style = getDefaultStyle(props)
    const hoverStyle = getHoverStyle(props)
    return (
      <button
        onmouseenter={(ev) => {
          {
            promisifyAnimation(
              ev.target as any,
              [{ background: style.background }, { background: hoverStyle.background }],
              { duration: 500, fill: 'forwards', easing: 'cubic-bezier(0.215, 0.610, 0.355, 1.000)' },
            )
          }
        }}
        onmouseleave={(ev) => {
          promisifyAnimation(
            ev.target as any,
            [{ background: hoverStyle.background }, { background: style.background }],
            {
              duration: 500,
              fill: 'forwards',
              easing: 'cubic-bezier(0.215, 0.610, 0.355, 1.000)',
            },
          )
        }}
        {...props}
        style={{
          ...style,
          cursor: props.disabled ? 'inherits' : 'pointer',
          ...props.style,
        }}>
        {children}
      </button>
    )
  },
})
