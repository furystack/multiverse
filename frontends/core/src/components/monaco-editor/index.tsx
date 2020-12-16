import { Shade, createComponent } from '@furystack/shades'

import * as monaco from 'monaco-editor/esm/vs/editor/editor.api'

export interface MonacoEditorProps {
  options: monaco.editor.IStandaloneEditorConstructionOptions
  value?: string
  onchange?: (value: string) => void
}
export const MonacoEditor = Shade<MonacoEditorProps>({
  constructed: ({ element, props }) => {
    const editor = monaco.editor.create(element.firstChild as HTMLElement, props.options)
    editor.setValue(props.value || '')
    props.onchange &&
      editor.onKeyUp(() => {
        const value = editor.getValue()
        props.onchange && props.onchange(value)
      })
  },
  render: () => {
    return <div style={{ width: '100%', height: '100%' }}></div>
  },
})
