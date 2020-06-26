/* eslint-disable @typescript-eslint/no-empty-interface */
import { Shade, createComponent, ChildrenList } from '@furystack/shades'
import { deepMerge } from '@furystack/utils'
import { Button } from '@furystack/shades-common-components'
import { MonacoEditor, MonacoEditorProps } from '../monaco-editor'
import { SchemaNames, EntityNames, MonacoModelProvider } from '../../services/monaco-model-provider'

export interface GenericMonacoEditorProps<T, TSchema extends SchemaNames, TEntity extends EntityNames<TSchema>> {
  data: T
  schema: TSchema
  entity: TEntity
  monacoProps?: MonacoEditorProps
  title: string
  onSave: (data: T) => Promise<void>
}

export interface GenericMonacoEditorState {
  lastSavedData: string
  currentData: string
  isDirty: boolean
}

export const GenericMonacoEditor: <T, TSchema extends SchemaNames, TEntity extends EntityNames<TSchema>>(
  props: GenericMonacoEditorProps<T, TSchema, TEntity>,
  children: ChildrenList,
) => JSX.Element<any, any> = Shade<GenericMonacoEditorProps<any, any, any>, GenericMonacoEditorState>({
  getInitialState: ({ props }) => {
    const data = JSON.stringify(props.data, undefined, 2)
    return {
      currentData: data,
      isDirty: false,
      lastSavedData: data,
    }
  },
  constructed: ({ getState }) => {
    const oldOnBeforeUnload = window.onbeforeunload
    window.onbeforeunload = () => {
      if (getState().currentData !== getState().lastSavedData) {
        return 'Are you sure you want to leave?'
      }
      return undefined
    }

    return () => {
      window.onbeforeunload = oldOnBeforeUnload
    }
  },
  render: ({ props, injector, updateState, getState }) => {
    const monacoProps = deepMerge(
      { options: {} },
      { ...props.monacoProps },
      {
        options: {
          theme: 'vs-dark',
          automaticLayout: true,
          model: injector
            .getInstance(MonacoModelProvider)
            .getModelForEntityType({ schema: props.schema, entity: props.entity }),
          language: 'json',
        },
      },
    )
    return (
      <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column' }}>
        <div style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2>{props.title}</h2>
          <div>
            <Button onclick={() => window.history.back()} title="Go Back">
              ↩
            </Button>
            <Button onclick={() => props.onSave(JSON.parse(getState().currentData))}>Save</Button>
          </div>
        </div>
        <div style={{ flexGrow: '1' }}>
          <MonacoEditor
            {...monacoProps}
            value={JSON.stringify(props.data, undefined, 2)}
            onchange={(v) => {
              updateState({ currentData: JSON.stringify(JSON.parse(v)) }, true)
            }}
          />
        </div>
      </div>
    )
  },
})
