import { Shade, createComponent, ChildrenList } from '@furystack/shades'
import { debounce, ObservableValue } from '@furystack/utils'

export interface AutoCompleteProps<T> {
  style?: CSSStyleDeclaration
  debounce?: number
  value?: string
  getSuggestions: (term: string) => Promise<T[]>
  renderSuggestion: (item: T) => JSX.Element
}

export interface AutoCompleteState<T> {
  isOpened: ObservableValue<boolean>
  suggestions: ObservableValue<T[]>
  value?: T
  fetchFn: (term: string) => Promise<T[]>
}

export const AutoCompleteSuggestionList = Shade<{ suggestions: ObservableValue<any[]> }>({
  render: () => {
    return <div></div>
  },
})

export const AutoComplete: <T>(props: AutoCompleteProps<T>, children: ChildrenList) => JSX.Element<any, any> = Shade<
  AutoCompleteProps<any>,
  AutoCompleteState<any>
>({
  shadowDomName: 'shade-auto-complete',
  getInitialState: ({ props }) => ({
    isOpened: new ObservableValue<boolean>(false),
    value: props.value,
    suggestions: new ObservableValue<any[]>([]),
    fetchFn: debounce(props.getSuggestions, props.debounce || 500),
  }),
  render: ({ props, updateState, getState }) => {
    const { isOpened, suggestions, fetchFn } = getState()
    return (
      <div style={{ ...props.style }}>
        <input
          type="text"
          onfocus={() => isOpened.setValue(true)}
          value={getState().value}
          onblur={() => {
            getState().isOpened.setValue(false)
          }}
          onkeyup={async (ev) => {
            const value = (ev.target as any).value as string
            updateState({ value }, true)
            const s = await fetchFn(value)
            suggestions.setValue(s)
          }}
        />
        <AutoCompleteSuggestionList suggestions={suggestions} />
      </div>
    )
  },
})
