import { Shade, createComponent, PartialElement } from '@furystack/shades'

export const Button = Shade<PartialElement<HTMLButtonElement>>({
  shadowDomName: 'shade-button',
  render: ({ props, element, children }) => {
    element.onmouseover = () => {
      const elementStyle = (element.firstElementChild as HTMLElement).style
      elementStyle.backgroundColor = 'rgba(0,0,0,0.2'
    }
    element.onmouseout = () => {
      const elementStyle = (element.firstElementChild as HTMLElement).style
      elementStyle.background = 'rgba(0,0,0,0.1)'
    }
    return (
      <button
        {...props}
        style={{
          background: 'rgba(0,0,0,0.1)',
          cursor: props.disabled ? 'inherits' : 'pointer',
          border: 'none',
          padding: '12px 20px',
          transition: 'background .41s linear',
          borderRadius: '3px',
          fontWeight: 'bolder',
          fontVariant: 'all-petite-caps',
          color: '#dedede',
          backdropFilter: 'blur(2px)',
          boxShadow: 'inset 0px 0px 26px 0px rgba(0,0,0,.2), 4px 4px 9px rgba(0,0,0,0.21)',
          ...props.style,
        }}>
        {children}
      </button>
    )
  },
})
