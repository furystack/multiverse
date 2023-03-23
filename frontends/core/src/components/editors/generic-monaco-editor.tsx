import type { ChildrenList } from '@furystack/shades'
import { Shade, createComponent } from '@furystack/shades'
import type { Injector } from '@furystack/inject'
import { Button, NotyService } from '@furystack/shades-common-components'
import { getErrorMessage, ThemeService } from '@common/frontend-utils'
import type { MonacoEditorProps } from '../monaco-editor'
import { MonacoEditor } from '../monaco-editor'
import type { SchemaNames, EntityNames } from '../../services/monaco-model-provider'
import { MonacoModelProvider } from '../../services/monaco-model-provider'

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

export const GenericMonacoEditor: <T, TSchema extends SchemaNames, TEntity extends EntityNames<TSchema>>(
  props: GenericMonacoEditorProps<T, TSchema, TEntity>,
  children: ChildrenList,
) => JSX.Element<any> = Shade<GenericMonacoEditorProps<any, any, any>>({
  shadowDomName: 'shades-generic-monaco-editor',
  constructed: ({ props, useState, injector }) => {
    const oldOnBeforeUnload = window.onbeforeunload
    window.onbeforeunload = () => {
      const [lastSavedData] = useState('lastSavedData', JSON.stringify(props.data))
      const [currentData] = useState('currentData', lastSavedData)
      if (props.readOnly !== false && currentData !== lastSavedData) {
        return 'Are you sure you want to leave?'
      }
      return undefined
    }

    const saveListener = (ev: KeyboardEvent) => {
      const [lastSavedData] = useState('lastSavedData', JSON.stringify(props.data))
      const [currentData] = useState('currentData', lastSavedData)
      if (ev.ctrlKey && ev.key.toLocaleLowerCase() === 's') {
        ev.preventDefault()
        ev.stopPropagation()
        props
          .onSave?.(JSON.parse(currentData))
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
    }
  },
  render: ({ props, injector, useObservable, useState }) => {
    const [themeName] = useObservable('themeName', injector.getInstance(ThemeService).themeNameObservable)

    const [lastSavedData] = useState('lastSavedData', JSON.stringify(props.data))
    const [currentData, setCurrentData] = useState('currentData', lastSavedData)

    const monacoProps: MonacoEditorProps = {
      ...props.monacoProps,
      options: {
        readOnly: props.readOnly,
        ...props.monacoProps?.options,
        theme: themeName === 'light' ? 'vs-light' : 'vs-dark',
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
                    action.action({ injector, entity: JSON.parse(currentData) })
                  }}
                >
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
                  await (props.onSave && props.onSave(JSON.parse(currentData)))
                  injector
                    .getInstance(NotyService)
                    .addNoty({ type: 'success', title: 'Saved', body: 'Your changes has been saved succesfully' })
                } catch (error) {
                  injector
                    .getInstance(NotyService)
                    .addNoty({ type: 'error', title: 'Failed to save', body: getErrorMessage(error) })
                }
              }}
            >
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
                setCurrentData(JSON.stringify(JSON.parse(v)))
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
