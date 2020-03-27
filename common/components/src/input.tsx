import { Shade, PartialElement, createComponent } from '@furystack/shades'

export interface InputProps extends PartialElement<HTMLInputElement> {
  labelTitle?: string
  multiLine?: false
}

export interface TextAreaProps extends PartialElement<HTMLTextAreaElement> {
  labelTitle?: string
  multiLine: true
}

export type TextInputProps = InputProps | TextAreaProps

export const Input = Shade<TextInputProps>({
  shadowDomName: 'shade-input',
  render: ({ props, element }) => {
    return (
      <label
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          fontSize: '10px',
          color: '#999',
          marginBottom: '1em',
          padding: '1em',
          borderRadius: '5px',
          transition:
            'background-color 300ms cubic-bezier(0.455, 0.030, 0.515, 0.955), box-shadow 300ms cubic-bezier(0.455, 0.030, 0.515, 0.955)',
        }}>
        {props.labelTitle}
        {props.multiLine ? (
          <div
            onfocus={() => {
              const labelStyle = (element.querySelector('label') as HTMLElement).style
              labelStyle.backgroundColor = 'rgba(255,255,255,0.02)'
              labelStyle.boxShadow = '0px 0px 5px rgba(0,0,0,.05)'
            }}
            onblur={() => {
              const labelStyle = (element.querySelector('label') as HTMLElement).style
              labelStyle.backgroundColor = 'transparent'
              labelStyle.boxShadow = 'none'
            }}
            contentEditable={props.readOnly === true || props.disabled === true ? 'inherit' : 'true'}
            {...props}
            style={{
              border: 'none',
              backgroundColor: 'transparent',
              outline: 'none',
              fontSize: '12px',
              width: '100%',
              textOverflow: 'ellipsis',
              color: props.disabled ? 'rgb(170, 170, 170)' : 'rgb(84, 84, 84)',
              ...props.style,
            }}>
            {props.value}
          </div>
        ) : (
          <input
            onfocus={() => {
              const labelStyle = (element.querySelector('label') as HTMLElement).style
              labelStyle.backgroundColor = 'rgba(255,255,255,0.05)'
              labelStyle.boxShadow = '0px 0px 5px rgba(0,0,0,.1)'
            }}
            onblur={() => {
              const labelStyle = (element.querySelector('label') as HTMLElement).style
              labelStyle.backgroundColor = 'transparent'
              labelStyle.boxShadow = 'none'
            }}
            {...props}
            style={{
              color: 'inherit',
              border: 'none',
              backgroundColor: 'transparent',
              outline: 'none',
              fontSize: '12px',
              width: '100%',
              textOverflow: 'ellipsis',
              ...props.style,
            }}
          />
        )}
      </label>
    )
  },
})
