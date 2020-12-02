/* eslint-disable @typescript-eslint/no-empty-interface */
import { Shade, createComponent, ChildrenList } from '@furystack/shades'
import { Injector } from '@furystack/inject'
import { Button, NotyService } from '@furystack/shades-common-components'
import { getErrorMessage } from '@common/frontend-utils'
import { MonacoEditor, MonacoEditorProps } from '../monaco-editor'
import { SchemaNames, EntityNames, MonacoModelProvider } from '../../services/monaco-model-provider'

export interface GenericMonacoEditorProps<T, TSchema extends SchemaNames, TEntity extends EntityNames<TSchema>> {
  data: T
  schema: TSchema
  entity: TEntity
  monacoProps?: MonacoEditorProps
  title: string
  additionalActions?: Array<{ name: string; action: (options: { entity: T; injector: Injector }) => Promise<void> }>
  readOnly?: boolean
  onSave?: (data: T) => Promise<void>
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
  constructed: ({ props, getState }) => {
    const oldOnBeforeUnload = window.onbeforeunload
    window.onbeforeunload = () => {
      const state = getState()
      if (props.readOnly !== true && state.currentData !== state.lastSavedData) {
        return 'Are you sure you want to leave?'
      }
      return undefined
    }

    return () => {
      window.onbeforeunload = oldOnBeforeUnload
    }
  },
  render: ({ props, injector, updateState, getState }) => {
    const monacoProps = {
      ...props.monacoProps,
      options: {
        readOnly: props.readOnly,
        ...props.monacoProps?.options,
        theme: 'vs-dark',
        automaticLayout: true,
        model: injector
          .getInstance(MonacoModelProvider)
          .getModelForEntityType({ schema: props.schema, entity: props.entity }),
        language: 'json',
      },
    }

    return (
      <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column' }}>
        <div style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2>{props.title}</h2>
          <div>
            {props.additionalActions &&
              props.additionalActions.map((action) => (
                <Button
                  onclick={() => {
                    action.action({ injector, entity: JSON.parse(getState().currentData) })
                  }}>
                  {action.name}
                </Button>
              ))}
            <Button onclick={() => window.history.back()} title="Go Back">
              ↩
            </Button>
            <Button
              disabled={props.readOnly}
              onclick={async () => {
                try {
                  await (props.onSave && props.onSave(JSON.parse(getState().currentData)))
                  injector
                    .getInstance(NotyService)
                    .addNoty({ type: 'success', title: 'Saved', body: 'Your changes has been saved succesfully' })
                } catch (error) {
                  injector
                    .getInstance(NotyService)
                    .addNoty({ type: 'error', title: 'Failed to save', body: getErrorMessage(error) })
                }
              }}>
              Save
            </Button>
          </div>
        </div>
        <div style={{ flexGrow: '1' }}>
          <MonacoEditor
            {...monacoProps}
            value={JSON.stringify(props.data, undefined, 2)}
            onchange={(v) => {
              try {
                updateState({ currentData: JSON.stringify(JSON.parse(v)) }, true)
              } catch (error) {
                // serialization error, ignore
              }
            }}
          />
        </div>
      </div>
    )
  },
})
