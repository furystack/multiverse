/* eslint-disable @typescript-eslint/no-empty-interface */
import { Shade, createComponent, ChildrenList } from '@furystack/shades'
import { Injector } from '@furystack/inject'
import { Button, defaultLightTheme, NotyService, ThemeProviderService } from '@furystack/shades-common-components'
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
  isLight: boolean
}

export const GenericMonacoEditor: <T, TSchema extends SchemaNames, TEntity extends EntityNames<TSchema>>(
  props: GenericMonacoEditorProps<T, TSchema, TEntity>,
  children: ChildrenList,
) => JSX.Element<any, any> = Shade<GenericMonacoEditorProps<any, any, any>, GenericMonacoEditorState>({
  shadowDomName: 'shades-generic-monaco-editor',
  getInitialState: ({ props, injector }) => {
    const data = JSON.stringify(props.data, undefined, 2)
    return {
      currentData: data,
      isDirty: false,
      lastSavedData: data,
      isLight: injector.getInstance(ThemeProviderService).theme.getValue() === defaultLightTheme,
    }
  },
  constructed: ({ props, getState, injector, updateState }) => {
    const oldOnBeforeUnload = window.onbeforeunload
    window.onbeforeunload = () => {
      const state = getState()
      if (props.readOnly !== true && state.currentData !== state.lastSavedData) {
        return 'Are you sure you want to leave?'
      }
      return undefined
    }

    const themeChanged = injector.getInstance(ThemeProviderService).theme.subscribe((t) => {
      updateState({ isLight: t === defaultLightTheme })
    })

    const saveListener = (ev: KeyboardEvent) => {
      if (ev.ctrlKey && ev.key.toLocaleLowerCase() === 's') {
        ev.preventDefault()
        ev.stopPropagation()
        props
          .onSave?.(JSON.parse(getState().currentData))
          .then(() =>
            injector
              .getInstance(NotyService)
              .addNoty({ type: 'success', title: 'Saved', body: 'Your changes has been saved succesfully' }),
          )
          .catch((error) =>
            injector
              .getInstance(NotyService)
              .addNoty({ type: 'error', title: 'Failed to save', body: getErrorMessage(error) }),
          )
      }
    }

    window.addEventListener('keydown', saveListener, true)

    return () => {
      window.removeEventListener('keydown', saveListener, true)
      window.onbeforeunload = oldOnBeforeUnload
      themeChanged.dispose()
    }
  },
  render: ({ props, injector, updateState, getState }) => {
    const monacoProps: MonacoEditorProps = {
      ...props.monacoProps,
      options: {
        readOnly: props.readOnly,
        ...props.monacoProps?.options,
        theme: getState().isLight ? 'vs-light' : 'vs-dark',
        automaticLayout: true,
        model: injector
          .getInstance(MonacoModelProvider)
          .getModelForEntityType({ schema: props.schema, entity: props.entity }),
        language: 'json',
        fontLigatures: true,
        fontFamily: 'Cascadia code, Times , Serif',
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
                  title={action.name}
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
              variant="contained"
              title="Save"
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
