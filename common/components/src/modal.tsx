import { Shade, createComponent } from '@furystack/shades'

export const Modal = Shade<{ isVisible: boolean; onClose?: () => void }>({
  shadowDomName: 'shade-modal',
  render: ({ props, children }) => {
    return props.isVisible ? (
      <div
        className="shade-backdrop"
        onclick={() => props.onClose?.()}
        style={
          {
            width: '100%',
            height: '100%',
            backgroundColor: 'rgba(128,128,128,0.03)',
            position: 'fixed',
            top: '0',
            left: '0',
            animation: 'show 100ms linear',
            backdropFilter: 'brightness(0.7)contrast(0.95)blur(50px)',
          } as any
        }>
        {children}
      </div>
    ) : (
      <div />
    )
  },
})
