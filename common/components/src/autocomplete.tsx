import { Shade, PartialElement, createComponent } from '@furystack/shades'
import { v4 } from 'uuid'
import { Input } from './input'

export const Autocomplete = Shade<
  { inputProps: PartialElement<HTMLInputElement>; suggestions: string[]; strict?: boolean },
  { dataListId: string }
>({
  getInitialState: () => ({
    dataListId: v4(),
  }),
  constructed: ({ getState, element }) => {
    const { dataListId } = getState()
    const input = element.querySelector('input')
    input && input.setAttribute('list', dataListId)
  },
  shadowDomName: 'shade-autocomplete',
  render: ({ props, getState }) => {
    const { dataListId } = getState()
    return (
      <div>
        <Input {...props.inputProps} />
        <datalist id={dataListId}>
          {props.suggestions.map((s) => (
            <option value={s} />
          ))}
        </datalist>
      </div>
    )
  },
})
